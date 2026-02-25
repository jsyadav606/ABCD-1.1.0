import { Role } from "../models/role.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

export const listRoles = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  const roles = await Role.find(filter).sort({ priority: 1, createdAt: -1 }).lean();

  return res
    .status(200)
    .json(new apiResponse(200, roles, "Roles retrieved successfully"));
});

export const getRoleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findById(id).lean();

  if (!role || role.isDeleted) {
    throw new apiError(404, "Role not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, role, "Role retrieved successfully"));
});

export const createRole = asyncHandler(async (req, res) => {
  const {
    name,
    displayName,
    description,
    organizationId,
    priority,
    isActive,
    isDefault,
    permissionKeys,
  } = req.body;

  if (!name || !displayName) {
    throw new apiError(400, "name and displayName are required");
  }

  if (!req.user?.id) {
    throw new apiError(401, "Authenticated user is required to create roles");
  }

  const existing = await Role.findOne({
    name: name.toLowerCase(),
    organizationId: organizationId || null,
    isDeleted: false,
  });

  if (existing) {
    throw new apiError(409, "A role with this name already exists");
  }

  const doc = await Role.create({
    name: name.toLowerCase(),
    displayName,
    description: description || "",
    organizationId: organizationId || null,
    category: organizationId ? "custom" : "system",
    priority: typeof priority === "number" ? priority : 100,
    isActive: isActive !== false,
    isDefault: isDefault === true,
    permissionKeys: Array.isArray(permissionKeys) ? permissionKeys : [],
    createdBy: req.user.id,
  });

  return res
    .status(201)
    .json(new apiResponse(201, doc, "Role created successfully"));
});

export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    displayName,
    description,
    priority,
    isActive,
    isDefault,
    permissionKeys,
  } = req.body;

  const role = await Role.findById(id);

  if (!role || role.isDeleted) {
    throw new apiError(404, "Role not found");
  }

  if (role.category !== "system" && typeof name === "string" && name.trim()) {
    role.name = name.toLowerCase();
  }

  if (typeof displayName === "string" && displayName.trim()) {
    role.displayName = displayName;
  }

  if (typeof description === "string") {
    role.description = description;
  }

  if (typeof priority === "number") {
    role.priority = priority;
  }

  if (typeof isActive === "boolean") {
    role.isActive = isActive;
  }

  if (typeof isDefault === "boolean") {
    role.isDefault = isDefault;
  }

  if (Array.isArray(permissionKeys)) {
    role.permissionKeys = permissionKeys;
  }

  if (req.user?.id) {
    role.updatedBy = req.user.id;
  }
  
  // Ensure createdBy points to a valid user to avoid pre-save hook failures on legacy data
  try {
    if (!role.createdBy) {
      role.createdBy = req.user?.id || role.createdBy;
    } else {
      const creator = await User.findById(role.createdBy).select("_id");
      if (!creator && req.user?.id) {
        role.createdBy = req.user.id;
      }
    }
  } catch (_) {
    // Fallback: if lookup fails, at least set to current user if available
    if (req.user?.id) {
      role.createdBy = req.user.id;
    }
  }

  await role.save();

  return res
    .status(200)
    .json(new apiResponse(200, role, "Role updated successfully"));
});

export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await Role.findById(id);

  if (!role || role.isDeleted) {
    throw new apiError(404, "Role not found");
  }

  if (role.category === "system") {
    throw new apiError(400, "System roles cannot be deleted");
  }

  await role.softDelete(req.user?.id || null);

  return res
    .status(200)
    .json(new apiResponse(200, null, "Role deleted successfully"));
});
