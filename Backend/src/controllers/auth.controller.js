import { authService } from "../services/auth.service.js";
import {
  getRefreshTokenCookieOptions,
  getClearRefreshTokenCookieOptions,
} from "../utils/tokenUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { UserLogin } from "../models/userLogin.model.js";

/**
 * Auth Controller - Handles HTTP requests for authentication
 * 
 * =====================================================
 * TOKEN FLOW & SECURITY:
 * =====================================================
 * 
 * 1. LOGIN FLOW:
 *    - Client sends: loginId (username/userId/email) + password + deviceId
 *    - Server validates, generates accessToken + refreshToken
 *    - refreshToken stored in httpOnly cookie (secure, not accessible by JS)
 *    - accessToken returned in response body (kept in memory/state)
 *    - Client stores: accessToken in memory/context, refreshToken in cookie (automatic)
 * 
 * 2. REQUEST FLOW (Authenticated):
 *    - Client sends accessToken in Authorization header (Bearer token)
 *    - Middleware verifies token - if invalid/expired, return 401
 *    - If token valid, proceed to route
 * 
 * 3. TOKEN REFRESH FLOW (when accessToken expires):
 *    - Client sends POST /refresh with deviceId
 *    - refreshToken auto-sent in cookie
 *    - Server validates refreshToken for device
 *    - Generates new accessToken + new refreshToken
 *    - Returns new accessToken in response + sets new refreshToken cookie
 *    - Client updates accessToken in memory
 * 
 * 4. LOGOUT FLOW:
 *    - Client sends POST /logout with deviceId
 *    - Server logs out device and clears refreshToken cookie
 *    - Client clears accessToken from memory
 * 
 * SECURITY NOTES:
 * - Refresh token: httpOnly cookie (XSRF protected, secure)
 * - Access token: Response body (client stores in memory, included in Authorization header)
 * - Credentials: Never require both tokens in one place
 * - Device tracking: Each device has unique deviceId and separate refresh token
 */

// =====================================================
// LOGIN CONTROLLER
// =====================================================
export const loginController = asyncHandler(async (req, res) => {
  const { loginId, password, deviceId = uuidv4() } = req.body;

  // Validation
  if (!loginId || !password) {
    throw new apiError(400, "Login ID (username/userId/email) and password are required");
  }

  // Get client IP and user agent
  const ipAddress =
    req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get("user-agent");

  // Call service (convert password to string if it's a number)
  const result = await authService.login(
    loginId,
    String(password),
    deviceId,
    ipAddress,
    userAgent
  );

  // Set refresh token in httpOnly cookie
  const refreshTokenCookieOptions = getRefreshTokenCookieOptions();
  res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);

  // Set access token in httpOnly cookie (for easier Postman/dev usage)
  // This is optional for SPA (which uses header) but helps in scenarios like Postman
  // Reuse same security options as refresh token but shorter expiry (session or short lived)
  res.cookie("accessToken", result.accessToken, {
    ...refreshTokenCookieOptions,
    // Typically accessToken is short lived, but cookie can match its expiry or be session
    // We'll use same secure settings.
  });

  return res.status(200).json(
    new apiResponse(200, {
      user: result.user,
      accessToken: result.accessToken,
      deviceId: result.deviceId,
      permissions: result.permissions,
      forcePasswordChange: result.forcePasswordChange || false,
    }, result.message)
  );
});

// =====================================================
// REAUTH CONTROLLER (Password-only re-authentication)
// =====================================================
export const reauthController = asyncHandler(async (req, res) => {
  const { password, deviceId = uuidv4() } = req.body;

  // Validation
  if (!password) {
    throw new apiError(400, "Password is required");
  }

  // Get userId from refresh token in cookie (user must have valid refresh token)
  let userId = null;
  if (req.cookies?.refreshToken) {
    try {
      const decoded = jwt.verify(
        req.cookies.refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "REFRESH_TOKEN_DEFAULT"
      );
      userId = decoded.id;
    } catch (error) {
      throw new apiError(401, "Invalid or expired refresh token");
    }
  }

  if (!userId) {
    throw new apiError(401, "Valid refresh token required for re-authentication");
  }

  // Get client IP and user agent
  const ipAddress =
    req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const userAgent = req.get("user-agent");

  // Call service
  const result = await authService.reauth(
    userId,
    String(password),
    deviceId,
    ipAddress,
    userAgent
  );

  // Set refresh token in httpOnly cookie
  const refreshTokenCookieOptions = getRefreshTokenCookieOptions();
  res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);

  // Set access token in httpOnly cookie
  res.cookie("accessToken", result.accessToken, {
    ...refreshTokenCookieOptions,
  });

  return res.status(200).json(
    new apiResponse(200, {
      user: result.user,
      accessToken: result.accessToken,
      deviceId: result.deviceId,
      permissions: result.permissions,
      forcePasswordChange: result.forcePasswordChange || false,
    }, result.message)
  );
});

// =====================================================
// LOGOUT CONTROLLER
// =====================================================
export const logoutController = asyncHandler(async (req, res) => {
  const { deviceId = uuidv4() } = req.body || {};
  
  // Try to get userId from verified JWT (normal flow)
  let userId = req.user?.id;
  
  // If not available, try to get from refreshToken in cookie
  if (!userId && req.cookies?.refreshToken) {
    try {
      const decoded = jwt.verify(
        req.cookies.refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "REFRESH_TOKEN_DEFAULT"
      );
      userId = decoded.id;
    } catch (error) {
      // Continue without userId, will fail below
    }
  }

  if (!userId) {
    throw new apiError(401, "Unauthorized - Please provide valid access token or refresh token");
  }

  // Call service
  const result = await authService.logout(userId, deviceId);

  // Clear refresh token cookie - res.cookie with empty value + maxAge:0 (more reliable than clearCookie)
  const clearOpts = getClearRefreshTokenCookieOptions();
  res.cookie("refreshToken", "", clearOpts);
  // Also clear with SameSite=Lax (browsers may have stored with different SameSite)
  res.cookie("refreshToken", "", { ...clearOpts, sameSite: "lax" });
  
  // Clear access token cookie too
  res.cookie("accessToken", "", clearOpts);
  res.cookie("accessToken", "", { ...clearOpts, sameSite: "lax" });

  return res.status(200).json(new apiResponse(200, null, result.message));
});

// =====================================================
// LOGOUT ALL DEVICES CONTROLLER
// =====================================================
export const logoutAllDevicesController = asyncHandler(async (req, res) => {
  // Try to get userId from verified JWT (normal flow)
  let userId = req.user?.id;

  // If not available, try to get from refreshToken in cookie
  if (!userId && req.cookies?.refreshToken) {
    try {
      const decoded = jwt.verify(
        req.cookies.refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "REFRESH_TOKEN_DEFAULT"
      );
      userId = decoded.id;
    } catch (error) {
      // Continue without userId, will fail below
    }
  }

  if (!userId) {
    throw new apiError(401, "Unauthorized - Please provide valid access token or refresh token");
  }

  // Call service
  const result = await authService.logoutAllDevices(userId);

  // Clear refresh token cookie
  const clearOpts = getClearRefreshTokenCookieOptions();
  res.cookie("refreshToken", "", clearOpts);
  res.cookie("refreshToken", "", { ...clearOpts, sameSite: "lax" });
  
  // Clear access token cookie too
  res.cookie("accessToken", "", clearOpts);
  res.cookie("accessToken", "", { ...clearOpts, sameSite: "lax" });

  return res.status(200).json(new apiResponse(200, null, result.message));
});

// =====================================================
// REFRESH TOKEN CONTROLLER
// =====================================================
export const refreshTokenController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  const { deviceId } = req.body || {};

  if (!refreshToken) {
    throw new apiError(401, "Refresh token is required");
  }

  // Call service (deviceId is optional, will auto-generate if not provided)
  const result = await authService.refreshTokens(refreshToken, deviceId);

  // Set new refresh token in cookie
  const refreshTokenCookieOptions = getRefreshTokenCookieOptions();
  res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);

  // Set new access token in cookie
  res.cookie("accessToken", result.accessToken, {
    ...refreshTokenCookieOptions,
  });

  return res.status(200).json(new apiResponse(200, {
    accessToken: result.accessToken,
  }, result.message));
});

// =====================================================
// ACTIVE DEVICES CONTROLLER
// =====================================================
export const getActiveDevicesController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new apiError(401, "Unauthorized");
  }

  // Call service
  const result = await authService.getActiveDevices(userId);

  return res.status(200).json(new apiResponse(200, {
    devices: result.devices,
  }, "Active devices retrieved"));
});

// =====================================================
// REVOKE TOKEN CONTROLLER
// =====================================================
export const revokeTokenController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { token } = req.body;

  if (!userId) {
    throw new apiError(401, "Unauthorized");
  }

  if (!token) {
    throw new apiError(400, "Token is required");
  }

  // Call service
  const result = await authService.revokeToken(userId, token);

  return res.status(200).json(new apiResponse(200, null, result.message));
});

// =====================================================
// CHANGE PASSWORD CONTROLLER
// =====================================================
export const changePasswordController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!userId) {
    throw new apiError(401, "Unauthorized");
  }

  // Validation
  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new apiError(400, "All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new apiError(400, "New password and confirm password do not match");
  }

  if (newPassword.length < 8) {
    throw new apiError(400, "New password must be at least 8 characters long");
  }

  // Call service
  const result = await authService.changePassword(
    userId,
    oldPassword,
    newPassword
  );

  // Clear refresh token cookie
  const clearOpts = getClearRefreshTokenCookieOptions();
  res.cookie("refreshToken", "", clearOpts);
  res.cookie("refreshToken", "", { ...clearOpts, sameSite: "lax" });

  return res.status(200).json(new apiResponse(200, null, result.message));
});

// =====================================================
// LOCK ACCOUNT CONTROLLER (Admin only)
// =====================================================
export const lockAccountController = asyncHandler(async (req, res) => {
  const { userId, reason } = req.body;

  if (!userId) {
    throw new apiError(400, "User ID is required");
  }

  // Call service
  const result = await authService.lockAccount(userId, reason);

  return res.status(200).json(new apiResponse(200, null, result.message));
});

// =====================================================
// UNLOCK ACCOUNT CONTROLLER (Admin only)
// =====================================================
export const unlockAccountController = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new apiError(400, "User ID is required");
  }

  // Call service
  const result = await authService.unlockAccount(userId);

  return res.status(200).json(new apiResponse(200, null, result.message));
});

// =====================================================
// VALIDATE TOKEN CONTROLLER
// =====================================================
export const validateTokenController = asyncHandler(async (req, res) => {
  const token =
    req.headers.authorization?.split(" ")[1] || req.body?.token;

  if (!token) {
    throw new apiError(401, "Token is required");
  }

  // Call service
  const result = await authService.validateAccessToken(token);

  return res.status(200).json(new apiResponse(200, result.data, "Token is valid"));
});

// =====================================================
// PROFILE CONTROLLER
// =====================================================
export const profileController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  console.log(`[PROFILE] Fetching profile for user: ${userId}`);
  
  if (!userId) {
    throw new apiError(401, "Unauthorized - No user ID in token");
  }

  try {
    // Fetch user document
    let userDoc;
    try {
      userDoc = await User.findById(userId).select("-password");
      if (!userDoc) {
        console.error(`[PROFILE] User not found: ${userId}`);
        throw new apiError(404, "User not found");
      }
    } catch (findErr) {
      if (findErr.kind === 'ObjectId') {
        throw new apiError(400, "Invalid user ID format");
      }
      console.error(`[PROFILE] Error finding user:`, findErr.message);
      throw findErr;
    }

    // Populate roleId if present
    let roleData = null;
    if (userDoc.roleId) {
      try {
        userDoc = await User.findById(userId)
          .select("-password")
          .populate("roleId")
          .lean();
        roleData = userDoc?.roleId;
      } catch (populateErr) {
        console.warn(`[PROFILE] Warning: Failed to populate roleId for ${userId}:`, populateErr.message);
        // Continue anyway, role data will be null
      }
    }

    // Fetch user login information for total login count
    let userLoginDoc = null;
    try {
      userLoginDoc = await UserLogin.findOne({ user: userId }).select("totalLoginCount");
    } catch (loginErr) {
      console.warn(`[PROFILE] Warning: Failed to fetch UserLogin for ${userId}:`, loginErr.message);
    }

    // Safe extraction of role information
    const roleId = roleData?._id || userDoc.roleId?._id || userDoc.roleId || null;
    const roleName = roleData?.name || userDoc.roleId?.name || null;

    const minimalUser = {
      _id: userDoc._id,
      userId: userDoc.userId,
      name: userDoc.name,
      email: userDoc.email,
      role: roleName,
      roleId: roleId,
      branchId: Array.isArray(userDoc.branchId) 
        ? userDoc.branchId.map(b => (b && b._id) ? b._id : b).filter(Boolean)
        : [],
      organizationId: userDoc.organizationId || null,
      totalLoginCount: userLoginDoc?.totalLoginCount || 0,
    };

    // Build permissions array safely
    let permissions = [];
    
    // Add user-specific permissions
    if (Array.isArray(userDoc.permissions) && userDoc.permissions.length > 0) {
      permissions = [...userDoc.permissions];
    }
    
    // Add role-based permissions
    if (roleData && Array.isArray(roleData.permissionKeys) && roleData.permissionKeys.length > 0) {
      permissions = [...permissions, ...roleData.permissionKeys];
    }
    
    // Super admin gets wildcard permission
    if (roleName === "super_admin" && !permissions.includes("*")) {
      permissions.push("*");
    }
    
    // Remove duplicates and sort
    permissions = Array.from(new Set(permissions)).sort();

    console.log(`[PROFILE] Successfully fetched profile for ${userId} with ${permissions.length} permissions`);

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { user: minimalUser, permissions },
          "Profile retrieved successfully"
        )
      );
  } catch (error) {
    if (error.statusCode) {
      // Custom apiError - rethrow to asyncHandler
      throw error;
    }
    console.error(`[PROFILE] Unexpected error fetching profile for userId ${userId}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    throw new apiError(500, `Failed to retrieve profile: ${error.message}`);
  }
});
