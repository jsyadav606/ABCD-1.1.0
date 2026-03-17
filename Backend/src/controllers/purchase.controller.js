import mongoose from "mongoose";
import { Purchase } from "../models/purchase.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { norm, toNumberOrNull } from "../utils/assetUtils.js";

const lc = (v) => norm(v).toLowerCase();

const normalizePurchase = (raw) => {
  const out = { ...raw };

  const purchaseType = lc(out.purchaseType);
  if (purchaseType === "po") {
    out.receiptNumber = null;
    out.receiptDate = null;
  } else if (purchaseType === "direct") {
    out.poNumber = null;
    out.poDate = null;
  } else {
    out.poNumber = null;
    out.poDate = null;
    out.receiptNumber = null;
    out.receiptDate = null;
  }

  const receivedOn = lc(out.itemReceivedOn);
  if (receivedOn === "invoice") {
    out.deliveryChallanNumber = null;
    out.deliveryChallanDate = null;
  } else if (receivedOn === "challan") {
    out.invoiceNumber = null;
    out.invoiceDate = null;
  } else {
    out.invoiceNumber = null;
    out.invoiceDate = null;
    out.deliveryChallanNumber = null;
    out.deliveryChallanDate = null;
  }

  out.purchaseCost = toNumberOrNull(out.purchaseCost);
  out.taxAmount = toNumberOrNull(out.taxAmount);
  out.totalAmount = toNumberOrNull(out.totalAmount);

  return out;
};

export const upsertPurchaseByAsset = asyncHandler(async (req, res) => {
  const assetId = req.params.assetId;
  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    throw new apiError(400, "Invalid assetId");
  }

  const base = normalizePurchase(req.body || {});
  const orgId = req.user?.organizationId || null;
  if (!orgId) {
    throw new apiError(400, "organizationId missing in user context");
  }

  const filter = { assetId, organizationId: orgId, isDeleted: false };
  const update = {
    ...base,
    assetId,
    organizationId: orgId,
    branchId: base.branchId || base.branch || null,
    itemCategory: base.itemCategory ? lc(base.itemCategory) : undefined,
    itemType: base.itemType ? lc(base.itemType) : undefined,
    updatedBy: req.user?._id || req.user?.id,
  };

  if (!update.createdBy) update.createdBy = req.user?._id || req.user?.id;

  const doc = await Purchase.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();

  return res.status(200).json(new apiResponse(200, doc, "Purchase saved"));
});

export const getPurchaseByAsset = asyncHandler(async (req, res) => {
  const assetId = req.params.assetId;
  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    throw new apiError(400, "Invalid assetId");
  }

  const orgId = req.user?.organizationId || null;
  const filter = { assetId, isDeleted: false };
  if (orgId) filter.organizationId = orgId;

  const doc = await Purchase.findOne(filter).lean();
  return res.status(200).json(new apiResponse(200, doc || null, "Purchase fetched"));
});

