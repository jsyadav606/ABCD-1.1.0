/**
 * Assets Controller
 * Description: Type-based dispatcher. Frontend ke itemType ke hisaab se specific handler (cpu/monitor) choose karta hai.
 * Goals:
 * - Simple surface for FE: /assets POST/GET/GET/:id sabhi item types ke liye kaam kare
 * - Fast list: handler ke andar lean() + sort, aur yahan merge when multiple types
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { handlers } from "../assets/handlers/index.js";
import { Purchase } from "../models/purchase.model.js";
import { Warranty } from "../models/warranty.model.js";

const normKey = (val) => String(val || "").trim().toLowerCase();

const getHandler = (itemType) => {
  const key = normKey(itemType);
  return handlers[key] || handlers.__generic;
};

export const createAsset = asyncHandler(async (req, res) => {
  const { itemType, itemCategory } = req.body;
  if (!itemType || !String(itemType).trim()) {
    throw new apiError(400, "itemType is required");
  }
  if (!itemCategory || !String(itemCategory).trim()) {
    throw new apiError(400, "itemCategory is required");
  }

  const handler = getHandler(itemType);
  const { doc, message } = await handler.create(req);
  return res.status(201).json(new apiResponse(201, doc, message || "Asset created successfully"));
});

export const listAssets = asyncHandler(async (req, res) => {
  const itemType = req.query?.itemType;
  if (itemType) {
    const handler = getHandler(itemType);
    const { items, message } = await handler.list(req);
    return res.status(200).json(new apiResponse(200, { items }, message || "Assets retrieved"));
  }

  // Agar specific type nahi diya, to sab types se parallel list fetch karke merge
  const orderedHandlers = Object.entries(handlers)
    .filter(([k]) => k !== "__generic")
    .map(([, h]) => h);

  const results = await Promise.all(orderedHandlers.map((h) => h.list(req)));
  const merged = results.flatMap((r) => r.items || []);
  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.status(200).json(new apiResponse(200, { items: merged }, "Assets retrieved"));
});

export const getAssetById = asyncHandler(async (req, res) => {
  const itemType = req.query?.itemType;
  if (itemType) {
    const handler = getHandler(itemType);
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
