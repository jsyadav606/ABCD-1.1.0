/**
 * Assets Controller
 * Description: Type-based dispatcher. Frontend ke AssetType ke hisaab se specific handler (cpu/monitor/printer) choose karta hai.
 * Goals:
 * - Simple surface for FE: /assets POST/GET/GET/:id sabhi item types ke liye kaam kare
 * - Fast list: handler ke andar lean() + sort, aur yahan merge when multiple types
 */
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { CPU } from "../models/fixed/cpu.model.js";
import { Monitor } from "../models/fixed/monitor.model.js";
import { Laptop } from "../models/fixed/laptop.model.js";
import { Printer } from "../models/fixed/printer.model.js";
import { Camera } from "../models/peripheral/camera.model.js";
import { Keyboard } from "../models/peripheral/keyboard.model.js";
import { Mouse } from "../models/peripheral/mouse.model.js";
import { Headphone } from "../models/peripheral/headphone.model.js";
import { handlers } from "../assets/handlers/index.js";
import { Purchase } from "../models/purchase.model.js";
import { Warranty } from "../models/warranty.model.js";
import { AssetCategory } from "../models/assetcategory.model.js";
import { AssetType } from "../models/assettype.model.js";

const normKey = (val) => String(val || "").trim().toLowerCase();

const getHandler = (AssetType) => {
  const key = normKey(AssetType);
  const handler = handlers[key] || handlers.__generic;
  if (!handler) {
    throw new apiError(400, `Unsupported AssetType: "${AssetType}". No handler found.`);
  }
  return handler;
};

export const createAsset = asyncHandler(async (req, res) => {
  const { AssetType: assetTypeName, AssetCategory: assetCategoryId } = req.body;
  if (!assetTypeName || !String(assetTypeName).trim()) {
    throw new apiError(400, "AssetType is required");
  }
  if (!assetCategoryId || !String(assetCategoryId).trim()) {
    throw new apiError(400, "AssetCategory is required");
  }

  // Validate AssetCategory exists
  const category = await AssetCategory.findOne({
    _id: assetCategoryId,
    isDeleted: false,
    isActive: true,
  });

  if (!category) {
    throw new apiError(400, "Invalid AssetCategory - category not found or inactive");
  }

  // Create or update AssetType
  await AssetType.findOneAndUpdate(
    {
      name: { $regex: `^${assetTypeName.trim()}$`, $options: "i" },
      category: assetCategoryId,
      isDeleted: false,
    },
    {
      name: assetTypeName.trim(),
      category: assetCategoryId,
      isActive: true,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  const handler = getHandler(assetTypeName);
  // Keep the original request body names for downstream handler code if needed
  req.body.AssetType = assetTypeName;
  req.body.assetType = assetTypeName;
  req.body.AssetCategory = assetCategoryId;
  req.body.assetCategory = assetCategoryId;
  req.body.AssetTypeId = req.body.AssetTypeId || null;

  const { doc, message } = await handler.create(req);
  return res.status(201).json(new apiResponse(201, doc, message || "Asset created successfully"));
});

export const listAssets = asyncHandler(async (req, res) => {
  const AssetType = req.query?.AssetType;
  if (AssetType) {
    const handler = getHandler(AssetType);
    const { items, message } = await handler.list(req);
    return res.status(200).json(new apiResponse(200, { items }, message || "Assets retrieved"));
  }

  // Agar specific type nahi diya, to sab types se parallel list fetch karke merge
  const orderedHandlers = Object.entries(handlers)
    .filter(([k]) => k !== "__generic")
    .map(([, h]) => h);

  const results = await Promise.all(
    orderedHandlers.map(async (h) => {
      try {
        return await h.list(req);
      } catch (err) {
        // Ignore unsupported/unimplemented handlers while merging
        console.warn("Asset handler list error (ignored):", err.message || err);
        return { items: [] };
      }
    })
  );

  const merged = results.flatMap((r) => r.items || []);
  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.status(200).json(new apiResponse(200, { items: merged }, "Assets retrieved"));
});

export const getAssetById = asyncHandler(async (req, res) => {
  const AssetType = req.query?.AssetType;
  if (AssetType) {
    const handler = getHandler(AssetType);
    const { doc, message } = await handler.getById(req);
    const [purchase, warranty] = await Promise.all([
      Purchase.findOne({ assetId: doc?._id, organizationId: req.user?.organizationId, isDeleted: false }).lean(),
      Warranty.findOne({ assetId: doc?._id, organizationId: req.user?.organizationId, isDeleted: false }).lean(),
    ]);
    return res.status(200).json(new apiResponse(200, { ...doc, purchase: purchase || null, warranty: warranty || null }, message || "Asset retrieved"));
  }

  // Try-all lookup: har handler se try karo jab tak mil na jaye (404 skip)
  const orderedHandlers = Object.entries(handlers)
    .filter(([k]) => k !== "__generic")
    .map(([, h]) => h);

  for (const h of orderedHandlers) {
    try {
      const { doc, message } = await h.getById(req);
      const [purchase, warranty] = await Promise.all([
        Purchase.findOne({ assetId: doc?._id, organizationId: req.user?.organizationId, isDeleted: false }).lean(),
        Warranty.findOne({ assetId: doc?._id, organizationId: req.user?.organizationId, isDeleted: false }).lean(),
      ]);
      return res.status(200).json(new apiResponse(200, { ...doc, purchase: purchase || null, warranty: warranty || null }, message || "Asset retrieved"));
    } catch (err) {
      if (err?.statusCode === 404) continue;
      throw err;
    }
  }

  throw new apiError(404, "Asset not found");
});

export const countAssets = asyncHandler(async (req, res) => {
  const branchId = req.query.branchId;
  const roleName = String(req.user?.role || "").toLowerCase();
  const isSuper = roleName === "super_admin" || roleName === "super admin";
  const filter = { isDeleted: false, isActive: true };

  // Always scope by organization
  if (req.user?.organizationId) {
    filter.organizationId = req.user.organizationId;
  }

  // Apply branch scoping
  // If specific branchId selected: apply for both super admins and regular users
  // If "__ALL__" or no branchId:
  //   - For super admin: show all branches (no filter)
  //   - For non-super admin: show only their assigned branches
  
  if (branchId && branchId !== "__ALL__" && branchId !== "") {
    // Selected branch is provided - apply for all roles
    try {
      if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json(new apiResponse(400, { total: 0 }, "Invalid branchId format"));
      }
      filter.branchId = new mongoose.Types.ObjectId(branchId);
    } catch (err) {
      console.error("Error converting branchId:", err.message);
      return res.status(400).json(new apiResponse(400, { total: 0 }, "Invalid branchId format"));
    }
  } else if (!isSuper) {
    // "__ALL__" or no branchId, and user is NOT super admin
    // Get user's assigned branches
    const userBranchIds = Array.isArray(req.user?.branchId)
      ? req.user.branchId.map((b) => (typeof b === "object" && b?._id ? b._id : b))
      : [];

    // Restrict to user's assigned branches only
    if (userBranchIds.length > 0) {
      filter.branchId = { $in: userBranchIds };
    }
  }
  // For super admin with "__ALL__" or no branchId: no branch filter (count all)

  // Count from both collections directly:
  // 1. Fixed assets (asset_fixed): All types (CPU, Monitor, Laptop, Printer) are in this collection
  // 2. Peripheral assets (asset_peripheral): All types (Camera, Keyboard, Mouse, Headphone) are in this collection
  // Use .collection.countDocuments to count all docs in the collection, not just one type
  const [fixedCount, peripheralCount] = await Promise.all([
    CPU.collection.countDocuments(filter), // asset_fixed collection
    Camera.collection.countDocuments(filter), // asset_peripheral collection
  ]);

  const total = fixedCount + peripheralCount;

  return res.status(200).json(new apiResponse(200, { total }, "Assets count retrieved"));
});

