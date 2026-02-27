import { Branch } from "../models/branch.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

export const listBranches = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }
  if (req.query.status) {
    filter.status = String(req.query.status).toUpperCase();
  }
  if (req.query.type) {
    filter.type = String(req.query.type).toUpperCase();
  }

  const branches = await Branch.find(filter).sort({ branchName: 1 }).lean();

  return res
    .status(200)
    .json(new apiResponse(200, branches, "Branches retrieved successfully"));
});

export const getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findById(id).lean();

  if (!branch) {
    throw new apiError(404, "Branch not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, branch, "Branch retrieved successfully"));
});

export const createBranch = asyncHandler(async (req, res) => {
  const {
    organizationId,
    branchCode,
    branchName,
    type,
    status,
    contactInfo,
    address,
    geoLocation,
    settings,
    metadata,
    admins,
  } = req.body;

  if (!branchName || !String(branchName).trim()) {
    throw new apiError(400, "branchName is required");
  }
  if (!branchCode || !String(branchCode).trim()) {
    throw new apiError(400, "branchCode is required");
  }

  const orgId = organizationId || req.user?.organizationId || req.body.organizationId;

  if (!orgId) {
    throw new apiError(400, "organizationId is required");
  }

  const existing = await Branch.findOne({
    organizationId: orgId,
    branchCode: String(branchCode).trim().toUpperCase(),
  });

  if (existing) {
    throw new apiError(409, "A branch with this code already exists in this organization");
  }

  const branch = await Branch.create({
    organizationId: orgId,
    branchCode: String(branchCode).trim().toUpperCase(),
    branchName: String(branchName).trim(),
    type: type ? String(type).toUpperCase() : undefined,
    status: status ? String(status).toUpperCase() : undefined,
    contactInfo: contactInfo && typeof contactInfo === "object" ? contactInfo : undefined,
    address: address && typeof address === "object" ? address : undefined,
    geoLocation: geoLocation && typeof geoLocation === "object" ? geoLocation : undefined,
    settings: settings && typeof settings === "object" ? settings : undefined,
    metadata: metadata && typeof metadata === "object" ? metadata : undefined,
    admins: Array.isArray(admins) ? admins : undefined,
    organizationId: orgId,
    createdBy: req.user?.id || req.user?._id || null,
  });

  return res
    .status(201)
    .json(new apiResponse(201, branch, "Branch created successfully"));
});

export const updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    branchCode,
    branchName,
    type,
    status,
    contactInfo,
    address,
    geoLocation,
    settings,
    metadata,
    admins,
  } = req.body;

  const branch = await Branch.findById(id);

  if (!branch) {
    throw new apiError(404, "Branch not found");
  }

  if (typeof branchName === "string" && branchName.trim()) {
    branch.branchName = branchName.trim();
  }
  if (branchCode !== undefined) {
    const newCode = branchCode ? String(branchCode).trim().toUpperCase() : "";
    if (newCode && newCode !== branch.branchCode) {
      const exists = await Branch.findOne({
        organizationId: branch.organizationId,
        branchCode: newCode,
        _id: { $ne: branch._id },
      });
      if (exists) {
        throw new apiError(409, "Another branch with this code already exists in this organization");
      }
    }
    branch.branchCode = newCode;
  }
  if (type !== undefined) {
    branch.type = String(type).toUpperCase();
  }
  if (status !== undefined) {
    branch.status = String(status).toUpperCase();
  }
  if (address !== undefined && typeof address === "object") {
    branch.address = address;
  }
  if (contactInfo !== undefined && typeof contactInfo === "object") {
    branch.contactInfo = contactInfo;
  }
  if (geoLocation !== undefined && typeof geoLocation === "object") {
    branch.geoLocation = geoLocation;
  }
  if (settings !== undefined && typeof settings === "object") {
    branch.settings = { ...branch.settings, ...settings };
  }
  if (metadata !== undefined && typeof metadata === "object") {
    branch.metadata = { ...branch.metadata, ...metadata };
  }
  if (admins !== undefined && Array.isArray(admins)) {
    branch.admins = admins;
  }
  branch.updatedBy = req.user?.id || req.user?._id || null;

  await branch.save();

  return res
    .status(200)
    .json(new apiResponse(200, branch, "Branch updated successfully"));
});

export const deleteBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findById(id);

  if (!branch) {
    throw new apiError(404, "Branch not found");
  }

  await Branch.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new apiResponse(200, null, "Branch deleted successfully"));
});
