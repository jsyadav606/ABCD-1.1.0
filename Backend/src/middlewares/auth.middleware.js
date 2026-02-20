import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { UserLogin } from "../models/userLogin.model.js";

/**
 * Auth Middleware - Verify JWT token and attach user to request
 */

export const verifyJWT = async (req, res, next) => {
  try {
    // Get token from Authorization header (with or without "Bearer" prefix)
    let token = null;
    
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      token = authHeader.startsWith("Bearer ") 
        ? authHeader.slice(7) 
        : authHeader;
    }
    
    // Fallback: check cookies and body
    if (!token) {
      token = req.cookies?.accessToken || req.body?.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Access token is missing. Send as 'Authorization: Bearer {token}' header",
      });
    }

    // Verify token
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is not configured");
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Fetch user details
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "User not found",
      });
    }

    // Require device info in access token to ensure device-scoped invalidation works
    if (!decoded.deviceId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Access token missing device information; please re-login",
      });
    }

    // Verify device tokenVersion matches stored value
    if (decoded.deviceId) {
      const userLogin = await UserLogin.findOne({ user: decoded.id });
      if (!userLogin) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "User login record not found",
        });
      }

      const device = Array.isArray(userLogin.loggedInDevices)
        ? userLogin.loggedInDevices.find((d) => d.deviceId === decoded.deviceId)
        : null;

      if (!device) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "Access token device not recognized",
        });
      }

      const tokenVersionInToken = decoded.deviceTokenVersion || 0;
      const currentDeviceVersion = device.tokenVersion || 0;
      if (tokenVersionInToken !== currentDeviceVersion) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "Access token has been invalidated",
        });
      }
    }

    if (!user.canLogin) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "User login is disabled",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "User account is blocked",
      });
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      ...user.toObject(),
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Access token has expired",
      });
    }

    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: error.message || "Invalid access token",
    });
  }
};

/**
 * Admin verification middleware
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user?.role || !["admin", "super_admin", "enterprise_admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Admin access required",
    });
  }
  next();
};

/**
 * Super Admin verification middleware
 */
export const verifySuperAdmin = (req, res, next) => {
  if (!req.user?.role || !["super_admin", "enterprise_admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Super Admin access required",
    });
  }
  next();
};

/**
 * Enterprise Admin verification middleware
 */
export const verifyEnterpriseAdmin = (req, res, next) => {
  if (req.user?.role !== "enterprise_admin") {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Enterprise Admin access required",
    });
  }
  next();
};
