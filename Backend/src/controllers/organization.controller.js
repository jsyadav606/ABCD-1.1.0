import { Organization } from "../models/organization.model.js";
import { Branch } from "../models/branch.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const isSuperAdmin = (req) => String(req.user?.role || "").toLowerCase() === "super_admin";

export const listOrganizations = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true";
  }

  if (!isSuperAdmin(req) && req.user?.organizationId) {
    filter._id = req.user.organizationId;
  }

  const organizations = await Organization.find(filter).sort({ name: 1 }).lean();

  return res
    .status(200)
    .json(new apiResponse(200, organizations, "Organizations retrieved successfully"));
});

export const getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isSuperAdmin(req) && req.user?.organizationId && String(req.user.organizationId) !== String(id)) {
    throw new apiError(403, "Access denied for this organization");
  }

  const organization = await Organization.findById(id).lean();

  if (!organization) {
    throw new apiError(404, "Organization not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, organization, "Organization retrieved successfully"));
});

export const createOrganization = asyncHandler(async (req, res) => {
  const { name, code, address, contactEmail, contactPhone, isActive, enabledFeatures, settings } = req.body;

  if (!name || !String(name).trim()) {
    throw new apiError(400, "name is required");
  }

  try {
    const org = await Organization.create({
      name: String(name).trim(),
      code: code ? String(code).trim().toLowerCase() : undefined,
      address: address ? String(address).trim() : undefined,
      contactEmail: contactEmail ? String(contactEmail).trim() : undefined,
      contactPhone: contactPhone ? String(contactPhone).trim() : undefined,
      isActive: isActive !== false,
      createdBy: req.user?._id,
      enabledFeatures: Array.isArray(enabledFeatures)
        ? Array.from(new Set(enabledFeatures.map((f) => String(f).trim().toUpperCase()).filter(Boolean)))
        : undefined,
      settings: settings && typeof settings === "object" ? settings : undefined,
    });

    return res
      .status(201)
      .json(new apiResponse(201, org, "Organization created successfully"));
  } catch (err) {
    if (err?.code === 11000) {
      throw new apiError(409, "Organization code already exists");
    }
    throw err;
  }
});

export const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isSuperAdmin(req) && req.user?.organizationId && String(req.user.organizationId) !== String(id)) {
    throw new apiError(403, "Access denied for this organization");
  }

  const update = {};
  const allowed = ["name", "code", "address", "contactEmail", "contactPhone", "isActive", "enabledFeatures", "settings"];
  for (const key of allowed) {
    if (req.body[key] === undefined) continue;
    update[key] = req.body[key];
  }

  if (update.name !== undefined) update.name = String(update.name).trim();
  if (update.code !== undefined) {
    update.code = update.code ? String(update.code).trim().toLowerCase() : undefined;
  }
  if (update.address !== undefined) update.address = update.address ? String(update.address).trim() : undefined;
  if (update.contactEmail !== undefined) update.contactEmail = update.contactEmail ? String(update.contactEmail).trim() : undefined;
  if (update.contactPhone !== undefined) update.contactPhone = update.contactPhone ? String(update.contactPhone).trim() : undefined;
  if (update.enabledFeatures !== undefined) {
    update.enabledFeatures = Array.isArray(update.enabledFeatures)
      ? Array.from(new Set(update.enabledFeatures.map((f) => String(f).trim().toUpperCase()).filter(Boolean)))
      : [];
  }
  if (update.settings !== undefined && !(update.settings && typeof update.settings === "object")) {
    update.settings = {};
  }

  try {
    const organization = await Organization.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!organization) {
      throw new apiError(404, "Organization not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, organization, "Organization updated successfully"));
  } catch (err) {
    if (err?.code === 11000) {
      throw new apiError(409, "Organization code already exists");
    }
    throw err;
  }
});

export const deleteOrganization = asyncHandler(async (req, res) => {
  if (!isSuperAdmin(req)) {
    throw new apiError(403, "Only super admin can delete organizations");
  }

  const { id } = req.params;

  const [hasBranches, hasUsers] = await Promise.all([
    Branch.exists({ organizationId: id }),
    User.exists({ organizationId: id }),
  ]);

  if (hasBranches || hasUsers) {
    throw new apiError(409, "Organization is in use and cannot be deleted");
  }

  const deleted = await Organization.findByIdAndDelete(id).lean();

  if (!deleted) {
    throw new apiError(404, "Organization not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, null, "Organization deleted successfully"));
});
