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
