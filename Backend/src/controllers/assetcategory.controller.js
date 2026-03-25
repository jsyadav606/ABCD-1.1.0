/**
 * Asset Category Controller
 * Description: CRUD operations for asset categories
 */
import { AssetCategory } from "../models/assetcategory.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

/**
 * CREATE: Asset Category
 * POST /api/v1/assetcategories
 */
export const createAssetCategory = asyncHandler(async (req, res) => {
  const { name, code, description, icon, sortOrder } = req.body;

  // Validation
  if (!name || !String(name).trim()) {
    throw new apiError(400, "Asset category name is required");
  }

  // Check duplicate name
  const existingByName = await AssetCategory.findOne({
    name: { $regex: `^${name.trim()}$`, $options: "i" },
    isDeleted: false,
  });

  if (existingByName) {
    throw new apiError(400, "Asset category with this name already exists");
  }

  // Check duplicate code if provided
  if (code && String(code).trim()) {
    const existingByCode = await AssetCategory.findOne({
      code: code.trim(),
      isDeleted: false,
    });

    if (existingByCode) {
      throw new apiError(400, "Asset category with this code already exists");
    }
  }

  const createData = {
    name: name.trim(),
    sortOrder: sortOrder || 0,
  };

  // Only add optional fields if they have values
  if (code && String(code).trim()) {
    createData.code = code.trim();
  }
  if (description && String(description).trim()) {
    createData.description = description.trim();
  }
  if (icon && String(icon).trim()) {
    createData.icon = icon.trim();
  }

  const category = await AssetCategory.create(createData);

  return res
    .status(201)
    .json(new apiResponse(201, category, "Asset category created successfully"));
});

/**
 * GET ALL: Asset Categories
 * GET /api/v1/assetcategories
 */
export const getAllAssetCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const isActive = req.query.isActive;

  const skip = (page - 1) * limit;

  // Build filter
  const filter = { isDeleted: false };
  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  // Fetch data with pagination
  const categories = await AssetCategory.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ sortOrder: 1, name: 1 });

  // Total count
  const total = await AssetCategory.countDocuments(filter);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { items: categories, meta: { page, limit, total } },
        "Asset categories retrieved successfully"
      )
    );
});

/**
 * GET BY ID: Asset Category
 * GET /api/v1/assetcategories/:id
 */
export const getAssetCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await AssetCategory.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!category) {
    throw new apiError(404, "Asset category not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, category, "Asset category retrieved successfully"));
});

/**
 * UPDATE: Asset Category
 * PUT /api/v1/assetcategories/:id
 */
export const updateAssetCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, description, icon, sortOrder, isActive } = req.body;

  const category = await AssetCategory.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!category) {
    throw new apiError(404, "Asset category not found");
  }

  // Check for duplicate name if changing
  if (name && String(name).trim() && name.trim() !== category.name) {
    const existingByName = await AssetCategory.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      isDeleted: false,
    });

    if (existingByName) {
      throw new apiError(400, "Asset category with this name already exists");
    }

    category.name = name.trim();
  }

  // Check for duplicate code if changing
  if (code && String(code).trim() && code.trim() !== category.code) {
    const existingByCode = await AssetCategory.findOne({
      _id: { $ne: id },
      code: code.trim(),
      isDeleted: false,
    });

    if (existingByCode) {
      throw new apiError(400, "Asset category with this code already exists");
    }

    category.code = code.trim();
  }

  // Update other fields
  if (description !== undefined) {
    category.description = description ? description.trim() : undefined;
  }
  if (icon !== undefined) {
    category.icon = icon ? icon.trim() : undefined;
  }
  if (sortOrder !== undefined) {
    category.sortOrder = sortOrder;
  }
  if (isActive !== undefined) {
    category.isActive = isActive;
  }

  await category.save();

  return res
    .status(200)
    .json(new apiResponse(200, category, "Asset category updated successfully"));
});

/**
 * DELETE: Asset Category (Soft Delete)
 * DELETE /api/v1/assetcategories/:id
 */
export const deleteAssetCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await AssetCategory.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!category) {
    throw new apiError(404, "Asset category not found");
  }

  category.isDeleted = true;
  await category.save();

  return res
    .status(200)
    .json(new apiResponse(200, null, "Asset category deleted successfully"));
});

/**
 * GET ACTIVE: List only active asset categories
 * GET /api/v1/assetcategories/active/list
 */
export const getActiveAssetCategories = asyncHandler(async (req, res) => {
  const categories = await AssetCategory.find({
    isActive: true,
    isDeleted: false,
  }).sort({ sortOrder: 1, name: 1 });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { items: categories, count: categories.length },
        "Active asset categories retrieved successfully"
      )
    );
});
