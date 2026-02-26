import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Role } from "../models/role.model.js";

/**
 * Middleware to verify user permissions based on role
 * @param {string} requiredPermission - The permission key required to access the route
 */
export const verifyPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    // 1. Ensure user is authenticated
    if (!req.user) {
      throw new apiError(401, "Unauthorized request: User not authenticated");
    }

    // 2. Check for super_admin role (bypass all checks)
    const roleName = req.user.role || req.user.roleId?.name;
    
    if (roleName === "super_admin") {
      return next();
    }

    // 3. Resolve permission keys from:
    // - rolePermissionKeys attached by verifyJWT
    // - userPermissionKeys (user-specific)
    // - fallback: fetch role by id
    let roleKeys = Array.isArray(req.user.rolePermissionKeys) ? req.user.rolePermissionKeys : [];
    let userKeys = Array.isArray(req.user.userPermissionKeys) ? req.user.userPermissionKeys : [];
    
    if (roleKeys.length === 0 && req.user.roleId) {
      try {
        const roleDoc = await Role.findById(req.user.roleId).select("permissionKeys name");
        if (roleDoc && Array.isArray(roleDoc.permissionKeys)) {
          roleKeys = roleDoc.permissionKeys;
        }
      } catch (e) {
        // ignore lookup errors; will fall back to empty keys
      }
    }
    
    const permissions = Array.from(new Set([...(roleKeys || []), ...(userKeys || [])]));

    // 4. Check if user has the required permission
    if (!permissions.includes(requiredPermission)) {
      throw new apiError(403, `Access denied. You do not have permission to perform this action. Required: ${requiredPermission}`);
    }

    next();
  });
};
