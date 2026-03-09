import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { handlers } from "../assets/handlers/index.js";

export const createAsset = asyncHandler(async (req, res) => {
  const { itemType } = req.body;
  if (!itemType || !String(itemType).trim()) {
    throw new apiError(400, "itemType is required");
  }

  const normalizedType = String(itemType).trim().toLowerCase();
  const handler = handlers[normalizedType];
  if (!handler || !handler.create) {
    throw new apiError(400, "Unsupported itemType");
  }
  const { doc, message } = await handler.create(req);
  return res.status(201).json(new apiResponse(201, doc, message || "Asset created successfully"));
});

export const listAssets = asyncHandler(async (req, res) => {
  const { itemType } = req.query;
  const type = String(itemType || "").trim().toLowerCase();
  const handler = handlers[type];
  if (!handler || !handler.list) {
    throw new apiError(400, "Unsupported itemType");
  }
  const { items, message } = await handler.list(req);
  return res.status(200).json(new apiResponse(200, { items }, message || "Assets retrieved"));
});

export const getAssetById = asyncHandler(async (req, res) => {
  const { itemType } = req.query;
  const type = String(itemType || "").trim().toLowerCase();
  const handler = handlers[type];
  if (!handler || !handler.getById) {
    throw new apiError(400, "Unsupported itemType");
  }
  const { doc, message } = await handler.getById(req);
  return res.status(200).json(new apiResponse(200, doc, message || "Asset retrieved"));
});
