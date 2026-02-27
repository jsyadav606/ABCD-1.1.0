/**
 * User Routes
 * 
 * Logics:
 * - All routes require verifyJWT (authenticated).
 * - Dropdowns:
 *   /dropdown/roles, /dropdown/branches, /dropdown/users for form population.
 * - Creation:
 *   POST / → createUser (server generates userId/seqId).
 * - Preview Next ID:
 *   GET /next-id → next userId without mutating sequence (for UI preview).
 * - Listing & Details:
 *   GET / → listUsers (with branch scoping); GET /:id → user by id.
 * - Updates:
 *   PUT /:id → general updates; toggle isActive, canLogin, role change;
 *   change-password bound to a user id.
 * - Deletion:
 *   soft-delete, restore, permanent delete endpoints.
 */

import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  toggleCanLogin,
  toggleIsActive,
  changeUserRole,
  softDeleteUser,
  restoreUser,
  deleteUserPermanent,
  getRolesForDropdown,
  getBranchesForDropdown,
  getUsersForDropdown,
  changeUserPassword,
  getNextUserId,
} from "../controllers/user.controller.js";

const router = express.Router();

// All user routes require authentication
router.use(verifyJWT);

// Get dropdown data for roles - Required for Add/Edit forms
router.get("/dropdown/roles", verifyPermission("users:users_list:view"), getRolesForDropdown);

// Get dropdown data for branches
router.get("/dropdown/branches", verifyPermission("users:users_list:view"), getBranchesForDropdown);

// Get dropdown data for users (managers)
router.get("/dropdown/users", verifyPermission("users:users_list:view"), getUsersForDropdown);

// Create a new user
router.post("/", verifyPermission("users:users_list:add"), createUser);

// Preview next userId (readonly, non-mutating)
router.get("/next-id", verifyPermission("users:users_list:add"), getNextUserId);

// List all users with filters and pagination
router.get("/", verifyPermission("users:users_list:view"), listUsers);

// Get user by ID
router.get("/:id", verifyPermission("users:users_list:view"), getUserById);

// Update user (general fields, not canLogin/isActive)
router.put("/:id", verifyPermission("users:users_list:edit"), updateUser);

// Toggle canLogin - enable/disable login credentials
router.post("/:id/toggle-can-login", verifyPermission("users:users_list:edit"), toggleCanLogin);

// Toggle isActive - enable/disable user account
router.post("/:id/toggle-is-active", verifyPermission("users:users_list:edit"), toggleIsActive);

// Change user role
router.post("/:id/change-role", verifyPermission("users:users_list:edit_role"), changeUserRole);

// Change user password
router.post("/:id/change-password", verifyPermission("users:users_list:change_password"), changeUserPassword);

// Soft-delete user (deactivate)
router.post("/:id/soft-delete", verifyPermission("users:users_list:delete"), softDeleteUser);

// Restore user
router.post("/:id/restore", verifyPermission("users:users_list:delete"), restoreUser);

// Permanently delete user
router.delete("/:id", verifyPermission("users:users_list:delete"), deleteUserPermanent);

export default router;
