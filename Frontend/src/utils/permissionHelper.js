/**
 * Frontend Permission Helper Utility
 * 
 * This utility provides functions to check permissions and control UI visibility
 * based on user permissions stored in localStorage after login
 * 
 * IMPORTANT: This is for UI convenience only - NOT security!
 * Backend must ALWAYS validate permissions independently
 */

/**
 * Get current user's permissions from localStorage
 * @returns {Array<string>} - Array of permission keys, or empty array if not logged in
 */
export const getCurrentUserPermissions = () => {
  try {
    // Check both possible storage locations
    // 1. New format: localStorage.getItem("permissions")
    const permissionsStr = localStorage.getItem("permissions");
    if (permissionsStr && permissionsStr !== 'undefined' && permissionsStr !== 'null') {
      try {
        const parsed = JSON.parse(permissionsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing permissions:", e);
      }
    }

    // 2. Legacy format: localStorage.getItem("authData")
    const authData = localStorage.getItem("authData");
    if (authData && authData !== 'undefined' && authData !== 'null') {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.permissions && Array.isArray(parsed.permissions)) {
          return parsed.permissions;
        }
      } catch (e) {
        console.error("Error parsing authData:", e);
      }
    }

    return [];
  } catch (error) {
    console.error("Error fetching permissions from localStorage:", error);
    return [];
  }
};

/**
 * Get current user data from localStorage
 * @returns {Object|null} - User object or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    // Check new format first: localStorage.getItem("user")
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const parsed = JSON.parse(userStr);
        if (parsed && parsed._id) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }

    // Check legacy format: localStorage.getItem("authData")
    const authData = localStorage.getItem("authData");
    if (authData && authData !== 'undefined' && authData !== 'null') {
      try {
        const parsed = JSON.parse(authData);
        return parsed.user || null;
      } catch (e) {
        console.error("Error parsing authData:", e);
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching user from localStorage:", error);
    return null;
  }
};

/**
 * Get current user's access token
 * @returns {string|null}
 */
export const getAccessToken = () => {
  try {
    const authData = localStorage.getItem("authData");
    if (!authData) {
      return null;
    }

    const parsed = JSON.parse(authData);
    return parsed.accessToken || null;
  } catch (error) {
    console.error("Error fetching access token:", error);
    return null;
  }
};

/**
 * Check if current user has a specific permission
 * 
 * @param {string} permissionKey - Permission to check (e.g., "user:create")
 * @returns {boolean} - true if user has permission, false otherwise
 * 
 * Examples:
 * - hasPermission("user:create") → true/false
 * - hasPermission("asset:delete") → true/false
 */
export const hasPermission = (permissionKey) => {
  const permissions = getCurrentUserPermissions();

  if (!permissions || permissions.length === 0) {
    return false;
  }

  // Wildcard check - SUPER_ADMIN has "*"
  if (permissions.includes("*")) {
    return true;
  }

  // Exact permission match
  return permissions.includes(permissionKey);
};

/**
 * Check if user has ANY of the specified permissions (OR logic)
 * 
 * @param {Array<string>} permissionKeys - Array of permissions to check
 * @returns {boolean}
 * 
 * Example:
 * - hasAnyPermission(["user:create", "user:update"]) → true if user has either
 */
export const hasAnyPermission = (permissionKeys) => {
  if (!Array.isArray(permissionKeys)) {
    return false;
  }

  const permissions = getCurrentUserPermissions();

  if (!permissions || permissions.length === 0) {
    return false;
  }

  if (permissions.includes("*")) {
    return true;
  }

  return permissionKeys.some((perm) => permissions.includes(perm));
};

/**
 * Check if user has ALL specified permissions (AND logic)
 * 
 * @param {Array<string>} permissionKeys - Array of permissions to check
 * @returns {boolean}
 * 
 * Example:
 * - hasAllPermissions(["user:create", "user:delete"]) → true only if user has both
 */
export const hasAllPermissions = (permissionKeys) => {
  if (!Array.isArray(permissionKeys)) {
    return false;
  }

  const permissions = getCurrentUserPermissions();

  if (!permissions || permissions.length === 0) {
    return false;
  }

  if (permissions.includes("*")) {
    return true;
  }

  return permissionKeys.every((perm) => permissions.includes(perm));
};

/**
 * Check if user is a Super Admin (has "*" permission)
 * @returns {boolean}
 */
export const isSuperAdmin = () => {
  const permissions = getCurrentUserPermissions();
  return permissions && permissions.includes("*");
};

/**
 * Get all permissions for a specific resource
 * 
 * @param {string} resource - Resource name (e.g., "user", "asset")
 * @returns {Array<string>} - Array of actions user can perform on this resource
 * 
 * Example:
 * - getResourcePermissions("user") → ["create", "read", "update"]
 */
export const getResourcePermissions = (resource) => {
  const permissions = getCurrentUserPermissions();

  if (!permissions || permissions.length === 0) {
    return [];
  }

  if (permissions.includes("*")) {
    return ["create", "read", "update", "delete", "export"];
  }

  return permissions
    .filter((perm) => perm.startsWith(`${resource}:`))
    .map((perm) => perm.split(":")[1]);
};

/**
 * Store authentication data (called after successful login)
 * 
 * @param {Object} authData - Authentication response from backend
 * @param {Object} authData.user - User object
 * @param {Array<string>} authData.permissions - User's permissions
 * @param {string} authData.accessToken - JWT access token
 * @param {string} authData.refreshToken - JWT refresh token
 */
export const setAuthData = (authData) => {
  try {
    localStorage.setItem("authData", JSON.stringify(authData));
  } catch (error) {
    console.error("Error storing auth data:", error);
  }
};

/**
 * Clear authentication data (called on logout)
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem("authData");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

/**
 * Clear ALL auth-related data from storage (called on logout).
 * Removes: accessToken, user, permissions, authData from localStorage,
 * and deviceId from sessionStorage.
 */
export const clearAllAuthStorage = () => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("permissions");
    localStorage.removeItem("authData");
    sessionStorage.removeItem("deviceId");
  } catch (error) {
    console.error("Error clearing auth storage:", error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user !== null;
};

/**
 * Get user's accessible branches
 * @returns {Array} - List of branch IDs user can access
 */
export const getUserAccessibleBranches = () => {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }

  // Super admin can access all branches
  if (isSuperAdmin()) {
    return ["*"];
  }

  return (user.branchId || []).map((id) => id.toString?.() || id);
};

/**
 * Get user's accessible enterprises/organizations
 * @returns {Array}
 */
export const getUserAccessibleEnterprises = () => {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }

  // Super admin can access all enterprises
  if (isSuperAdmin()) {
    return ["*"];
  }

  const enterprises = Array.isArray(user.organizationId)
    ? user.organizationId
    : user.organizationId
      ? [user.organizationId]
      : [];

  return enterprises.map((id) => id.toString?.() || id);
};

/**
 * Check if user can access a specific scope
 * 
 * @param {string|ObjectId} resourceBranchId - Branch ID of resource
 * @param {string|ObjectId} resourceEnterpriseId - Enterprise ID of resource
 * @returns {boolean}
 */
export const canAccessScope = (resourceBranchId, resourceEnterpriseId) => {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }

  // Super admin can access any scope
  if (isSuperAdmin()) {
    return true;
  }

  // Check enterprise access
  if (resourceEnterpriseId) {
    const userEnterpriseIds = getUserAccessibleEnterprises();
    if (userEnterpriseIds.length > 0 && !userEnterpriseIds.includes("*")) {
      if (!userEnterpriseIds.includes(resourceEnterpriseId.toString())) {
        return false;
      }
    }
  }

  // Check branch access
  if (resourceBranchId) {
    const userBranchIds = getUserAccessibleBranches();
    if (userBranchIds.length > 0 && !userBranchIds.includes("*")) {
      if (!userBranchIds.includes(resourceBranchId.toString())) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Log permission check for debugging
 * @param {string} permissionKey
 * @param {boolean} result
 */
export const logPermissionCheck = (permissionKey, result) => {
  if (import.meta.env.VITE_DEBUG_PERMISSIONS === "true") {
    console.log(
      `[Permission Check] ${permissionKey}: ${result ? "✅ ALLOWED" : "❌ DENIED"}`
    );
  }
};

/**
 * Utility: Create a conditional render helper
 * Usage: canRender("user:create") && renderComponent()
 */
export const canRender = (permissionKey) => {
  return hasPermission(permissionKey);
};

/**
 * Parse permission string into resource and action
 * @param {string} permissionKey - e.g., "user:create"
 * @returns {Object|null} - {resource: "user", action: "create"}
 */
export const parsePermission = (permissionKey) => {
  if (!permissionKey || typeof permissionKey !== "string") {
    return null;
  }

  if (permissionKey === "*") {
    return { resource: "*", action: "*", isWildcard: true };
  }

  const parts = permissionKey.split(":");
  if (parts.length !== 2) {
    return null;
  }

  return {
    resource: parts[0],
    action: parts[1],
    isWildcard: false,
  };
};

/**
 * Get display name for a permission
 * @param {string} permissionKey
 * @returns {string}
 */
export const getPermissionDisplayName = (permissionKey) => {
  const permissionDescriptions = {
    "user:create": "Create Users",
    "user:read": "View Users",
    "user:update": "Edit Users",
    "user:delete": "Delete Users",
    "user:disable": "Enable/Disable Users",
    "user:change_password": "Change User Passwords",
    "asset:create": "Add Assets",
    "asset:read": "View Assets",
    "asset:update": "Edit Assets",
    "asset:delete": "Delete Assets",
    "asset:assign": "Assign Assets",
    "asset:transfer": "Transfer Assets",
    "report:view": "View Reports",
    "report:export": "Export Reports",
    "*": "Full System Access",
  };

  return permissionDescriptions[permissionKey] || permissionKey;
};

// =====================================================
// React/Component Helpers (if using React)
// =====================================================

/**
 * HOC Component Guard (for React)
 * Usage: <ProtectedElement permission="user:create" fallback={null}>...</ProtectedElement>
 */
export const withPermissionCheck = (Component, requiredPermission) => {
  return (props) => {
    if (!hasPermission(requiredPermission)) {
      return null;
    }

    return Component(props);
  };
};
