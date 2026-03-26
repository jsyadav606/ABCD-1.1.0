import express from "express";
import { createRateLimiter } from "../middlewares/security.middleware.js";
import {
  loginController,
  reauthController,
  logoutController,
  logoutAllDevicesController,
  refreshTokenController,
  getActiveDevicesController,
  revokeTokenController,
  changePasswordController,
  lockAccountController,
  unlockAccountController,
  validateTokenController,
  profileController,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

//! Public routes
// Purpose: Authenticate user and return accessToken + set refreshToken cookie
// POST /login { loginId, password, deviceId? }
const useLimiter = process.env.NODE_ENV === "production";
const authLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });
router.post("/login", useLimiter ? authLimiter : (req, res, next) => next(), loginController);

// Purpose: Re-authenticate user with password only (for session timeout)
// POST /reauth { password, deviceId } (requires valid refresh token in cookie)
router.post("/reauth", useLimiter ? authLimiter : (req, res, next) => next(), reauthController);

// Purpose: Validate refresh token and issue new accessToken (sets new refresh cookie)
// POST /refresh { refreshToken? (cookie or body), deviceId? }
router.post("/refresh", useLimiter ? authLimiter : (req, res, next) => next(), refreshTokenController);

// Purpose: Validate an access token (or token in body) and return decoded payload
// POST /validate { token? (uses Authorization header if omitted) }
router.post("/validate", validateTokenController);

//! Protected routes (require authentication)
// Purpose: Get current user's profile and permissions
// GET /profile (Auth: Bearer token)
router.get("/profile", verifyJWT, profileController);
// Purpose: Logout current device (clear refresh token for device)
// POST /logout { deviceId? } (Auth: Bearer token or refreshToken cookie)
router.post("/logout", verifyJWT, logoutController);


// Purpose: Logout from all devices and clear refresh token cookie
// POST /logout-all { none } (Auth: Bearer token or refreshToken cookie)
router.post("/logout-all", verifyJWT, logoutAllDevicesController);

// Purpose: Return list of active devices for authenticated user
// GET /devices { none } (Auth: Bearer token)
router.get("/devices", verifyJWT, getActiveDevicesController);

// Purpose: Revoke a specific refresh token for the authenticated user
// POST /revoke-token { token } (Auth: Bearer token)
router.post("/revoke-token", verifyJWT, revokeTokenController);

// Purpose: Change authenticated user's password and clear refresh tokens
// POST /change-password { oldPassword, newPassword, confirmPassword } (Auth: Bearer token)
router.post("/change-password", verifyJWT, changePasswordController);


//! Admin routes
// Purpose: Lock a user's account (admin only)
// POST /lock-account { userId, reason }
router.post("/lock-account", verifyJWT, lockAccountController);

// Purpose: Unlock a user's account (admin only)
// POST /unlock-account { userId }
router.post("/unlock-account", verifyJWT, unlockAccountController);

export default router;
