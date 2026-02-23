import { Branch } from "../models/branch.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

export const listBranches = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  const branches = await Branch.find(filter).sort({ name: 1 }).lean();

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
  const { name, code, address, organizationId, isActive } = req.body;

  if (!name) {
    throw new apiError(400, "name is required");
  }

  const orgId =
    organizationId || req.user?.organizationId || req.body.organizationId;

  if (!orgId) {
    throw new apiError(400, "organizationId is required");
  }

  const existing = await Branch.findOne({
    name: name.trim(),
    organizationId: orgId,
  });

  if (existing) {
    throw new apiError(409, "A branch with this name already exists");
  }

  const branch = await Branch.create({
    name: name.trim(),
    code: code ? String(code).trim() : undefined,
    address: address ? String(address).trim() : undefined,
    organizationId: orgId,
    isActive: isActive !== false,
    createdBy: req.user?.id || null,
  });

  return res
    .status(201)
    .json(new apiResponse(201, branch, "Branch created successfully"));
});

export const updateBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, address, isActive } = req.body;

  const branch = await Branch.findById(id);

  if (!branch) {
    throw new apiError(404, "Branch not found");
  }

  if (typeof name === "string" && name.trim()) {
    branch.name = name.trim();
  }

  if (code !== undefined) {
    branch.code = code ? String(code).trim() : "";
  }

  if (address !== undefined) {
    branch.address = address ? String(address).trim() : "";
  }

  if (typeof isActive === "boolean") {
    branch.isActive = isActive;
  }

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

