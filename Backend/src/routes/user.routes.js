import express from "express";
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
  changeUserPassword,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get dropdown data for roles
router.get("/dropdown/roles", getRolesForDropdown);

// Get dropdown data for branches
router.get("/dropdown/branches", getBranchesForDropdown);

// Create a new user
router.post("/", createUser);

// List all users with filters and pagination
router.get("/", listUsers);

// Get user by ID
router.get("/:id", getUserById);

// Update user (general fields, not canLogin/isActive)
router.put("/:id", updateUser);

// Toggle canLogin - enable/disable login credentials
// POST /users/:id/toggle-can-login { enable: true/false, loginId?: "userId|email|username" }
router.post("/:id/toggle-can-login", toggleCanLogin);

// Toggle isActive - enable/disable user account
// POST /users/:id/toggle-is-active { enable: true/false }
router.post("/:id/toggle-is-active", toggleIsActive);

// Change user role
// POST /users/:id/change-role { roleId?: "...", role?: "user|admin|..." }
router.post("/:id/change-role", changeUserRole);

// Change user password
// POST /users/:id/change-password { newPassword: "..." }
router.post("/:id/change-password", changeUserPassword);

// Soft-delete user (deactivate)
router.post("/:id/soft-delete", softDeleteUser);

// Restore user
router.post("/:id/restore", restoreUser);

// Permanently delete user
router.delete("/:id", deleteUserPermanent);

export default router;
