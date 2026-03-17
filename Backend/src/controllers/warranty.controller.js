import mongoose from "mongoose";
import { Warranty } from "../models/warranty.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { norm, toNumberOrNull } from "../utils/assetUtils.js";

const lc = (v) => norm(v).toLowerCase();

const normalizeWarranty = (raw) => {
  const out = { ...raw };

  out.inYear = toNumberOrNull(out.inYear);
  out.inMonth = toNumberOrNull(out.inMonth);

  const warrantyAvailable = lc(out.warrantyAvailable) || "no";
  if (warrantyAvailable !== "yes") {
    out.warrantyMode = null;
    out.inYear = null;
    out.inMonth = null;
    out.warrantyStartDate = null;
    out.warrantyEndDate = null;
    out.warrantyProvider = null;
    out.supportVendor = null;
    out.supportPhone = null;
    out.supportEmail = null;
    // Clear calculated fields when warranty not available
    out.warrantyTillDate = null;
    out.warrantyStatus = null;
  } else {
    out.amcAvailable = null;
    out.amcVendor = null;
    out.amcStartDate = null;
    out.amcEndDate = null;

    const mode = lc(out.warrantyMode);
    if (mode === "duration") {
      out.warrantyStartDate = null;
      out.warrantyEndDate = null;
    } else if (mode === "enddate") {
      out.inYear = null;
      out.inMonth = null;
    } else {
      out.inYear = null;
      out.inMonth = null;
      out.warrantyStartDate = null;
      out.warrantyEndDate = null;
    }

    const provider = lc(out.warrantyProvider);
    if (provider !== "extended") {
      out.supportVendor = null;
      out.supportPhone = null;
      out.supportEmail = null;
    }

    // Frontend already calculated warrantyTillDate, backend just validates it
    // Ensure warrantyTillDate is a valid date if present
    if (out.warrantyTillDate) {
      try {
        const dateObj = new Date(out.warrantyTillDate);
        if (isNaN(dateObj.getTime())) {
          out.warrantyTillDate = null;
          out.warrantyStatus = null;
        } else {
          // Convert to ISO string for consistent storage
          out.warrantyTillDate = dateObj;
          
          // Calculate warranty status based on warranty till date
          // Industrial Standard: If today > warrantyTillDate, warranty is expired
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tillDate = new Date(dateObj);
          tillDate.setHours(0, 0, 0, 0);
          
          if (today > tillDate) {
            out.warrantyStatus = "Expired";
          } else {
            out.warrantyStatus = "Under Warranty";
          }
        }
      } catch (e) {
        out.warrantyTillDate = null;
        out.warrantyStatus = null;
      }
    } else {
      out.warrantyStatus = null;
    }
  }

  if (warrantyAvailable === "no") {
    const amcAvailable = lc(out.amcAvailable);
    if (amcAvailable !== "yes") {
      out.amcVendor = null;
      out.amcStartDate = null;
      out.amcEndDate = null;
    }
  }

  out.warrantyAvailable = warrantyAvailable === "yes" ? "Yes" : "No";
  return out;
};

export const upsertWarrantyByAsset = asyncHandler(async (req, res) => {
  const assetId = req.params.assetId;
  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    throw new apiError(400, "Invalid assetId");
  }

  const orgId = req.user?.organizationId || null;
  if (!orgId) {
    throw new apiError(400, "organizationId missing in user context");
  }

  // Normalize and validate warranty data
  // Frontend already calculated warrantyTillDate and remainingWarranty
  const base = normalizeWarranty(req.body || {});
  
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

  const doc = await Warranty.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();

  return res.status(200).json(new apiResponse(200, doc, "Warranty saved"));
});

export const getWarrantyByAsset = asyncHandler(async (req, res) => {
  const assetId = req.params.assetId;
  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    throw new apiError(400, "Invalid assetId");
  }

  const orgId = req.user?.organizationId || null;
  const filter = { assetId, isDeleted: false };
  if (orgId) filter.organizationId = orgId;

  const doc = await Warranty.findOne(filter).lean();
  return res.status(200).json(new apiResponse(200, doc || null, "Warranty fetched"));
});

