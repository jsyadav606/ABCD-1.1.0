import { Organization } from "../models/organization.model.js";
import { Branch } from "../models/branch.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const isSuperAdmin = (req) => String(req.user?.role || "").toLowerCase() === "super_admin";

export const listOrganizations = asyncHandler(async (req, res) => {
  const filter = {};

  // Backward-compatible: isActive=true/false -> status ACTIVE/INACTIVE
  if (req.query.isActive !== undefined) {
    filter.status = req.query.isActive === "true" ? "ACTIVE" : "INACTIVE";
  }
  if (req.query.status) {
    const valid = ["ACTIVE", "INACTIVE", "SUSPENDED"];
    const s = String(req.query.status).toUpperCase();
    if (valid.includes(s)) filter.status = s;
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

// Get userId sequence configuration and current counters
export const getUserIdSequenceConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isSuperAdmin(req) && req.user?.organizationId && String(req.user.organizationId) !== String(id)) {
    throw new apiError(403, "Access denied for this organization");
  }
  const org = await Organization.findById(id).select("userSequence settings");
  if (!org) {
    throw new apiError(404, "Organization not found");
  }
  const start = (org.settings && Number.isFinite(Number(org.settings.userIdSequenceStart)))
    ? Number(org.settings.userIdSequenceStart)
    : 21000;
  const prefix = (org.settings && typeof org.settings.userIdPrefix === "string" && org.settings.userIdPrefix.trim())
    ? org.settings.userIdPrefix.trim()
    : "U";
  const nextNumeric = Math.max(org.userSequence || 0, start) + 1;
  const nextId = `${prefix}${nextNumeric}`;
  return res.status(200).json(new apiResponse(200, {
    prefix,
    sequenceStart: start,
    currentSequence: org.userSequence || 0,
    nextNumeric,
    nextId
  }, "UserId sequence configuration"));
});

// Update userId sequence configuration (prefix and/or starting number)
export const updateUserIdSequenceConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sequenceStart, prefix } = req.body;

  if (!isSuperAdmin(req) && req.user?.organizationId && String(req.user.organizationId) !== String(id)) {
    throw new apiError(403, "Access denied for this organization");
  }

  const updateOps = {};
  if (sequenceStart !== undefined) {
    const n = Number(sequenceStart);
    if (!Number.isFinite(n) || n < 0) {
      throw new apiError(400, "sequenceStart must be a non-negative number");
    }
    updateOps["settings.userIdSequenceStart"] = n;
  }
  if (prefix !== undefined) {
    const p = String(prefix).trim();
    if (!p) {
      throw new apiError(400, "prefix cannot be empty");
    }
    updateOps["settings.userIdPrefix"] = p;
  }
  if (Object.keys(updateOps).length === 0) {
    throw new apiError(400, "Nothing to update");
  }

  // Ensure current counter is at least the new starting value to avoid duplicates
  const updateDoc = {
    $set: updateOps,
  };
  if (sequenceStart !== undefined) {
    updateDoc.$max = { userSequence: Number(sequenceStart) };
  }

  const org = await Organization.findByIdAndUpdate(id, updateDoc, { new: true, projection: { userSequence: 1, settings: 1 } });
  if (!org) {
    throw new apiError(404, "Organization not found");
  }
  console.log(`⚙️ Updated userId sequence config for org=${id}:`, updateOps);

  const start = (org.settings && Number.isFinite(Number(org.settings.userIdSequenceStart)))
    ? Number(org.settings.userIdSequenceStart)
    : 21000;
  const finalPrefix = (org.settings && typeof org.settings.userIdPrefix === "string" && org.settings.userIdPrefix.trim())
    ? org.settings.userIdPrefix.trim()
    : "U";
  const nextNumeric = Math.max(org.userSequence || 0, start) + 1;
  const nextId = `${finalPrefix}${nextNumeric}`;

  return res.status(200).json(new apiResponse(200, {
    prefix: finalPrefix,
    sequenceStart: start,
    currentSequence: org.userSequence || 0,
    nextNumeric,
    nextId
  }, "UserId sequence configuration updated"));
});

export const createOrganization = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    sortName,
    type,
    registrationDetails,
    contactInfo,
    address,
    subscription,
    status,
    metadata,
    enabledFeatures,
  } = req.body;

  if (!name || !String(name).trim()) {
    throw new apiError(400, "name is required");
  }
  if (!code || !String(code).trim()) {
    throw new apiError(400, "code is required");
  }

  const payload = {
    name: String(name).trim(),
    code: String(code).trim().toUpperCase(),
    sortName: sortName ? String(sortName).trim().toUpperCase() : String(name).trim().toUpperCase(),
    type: type || undefined,
    registrationDetails: registrationDetails && typeof registrationDetails === "object" ? registrationDetails : undefined,
    contactInfo: contactInfo && typeof contactInfo === "object" ? contactInfo : undefined,
    address: address && typeof address === "object" ? address : undefined,
    subscription: subscription && typeof subscription === "object" ? subscription : undefined,
    status: status ? String(status).toUpperCase() : undefined,
    metadata: metadata && typeof metadata === "object" ? metadata : undefined,
    createdBy: req.user?._id,
    enabledFeatures: Array.isArray(enabledFeatures)
      ? Array.from(new Set(enabledFeatures.map((f) => String(f).trim().toUpperCase()).filter(Boolean)))
      : undefined,
  };

  try {
    const org = await Organization.create(payload);
    return res
      .status(201)
      .json(new apiResponse(201, org, "Organization created successfully"));
  } catch (err) {
    if (err?.code === 11000) {
      throw new apiError(409, "Organization code or sortName already exists");
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
  const allowed = [
    "name",
    "code",
    "sortName",
    "type",
    "registrationDetails",
    "contactInfo",
    "address",
    "subscription",
    "status",
    "metadata",
    "enabledFeatures",
  ];
  for (const key of allowed) {
    if (req.body[key] === undefined) continue;
    update[key] = req.body[key];
  }

  if (update.name !== undefined) update.name = String(update.name).trim();
  if (update.code !== undefined) update.code = update.code ? String(update.code).trim().toUpperCase() : undefined;
  if (update.sortName !== undefined) update.sortName = update.sortName ? String(update.sortName).trim().toUpperCase() : undefined;
  if (update.status !== undefined) update.status = String(update.status).toUpperCase();
  // Normalize enabledFeatures to uppercase labels
  if (update.enabledFeatures !== undefined) {
    update.enabledFeatures = Array.isArray(update.enabledFeatures)
      ? Array.from(new Set(update.enabledFeatures.map((f) => String(f).trim().toUpperCase()).filter(Boolean)))
      : [];
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
      throw new apiError(409, "Organization code or sortName already exists");
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
