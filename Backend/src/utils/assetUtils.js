/**
 * Asset Utilities
 * Purpose: Repeated helper logic ko centralize karna taa ki handlers aur controllers simple aur readable rahein.
 */
import mongoose from "mongoose";

export const norm = (val) => (val == null ? "" : String(val).trim());

export const toNumberOrNull = (val) => {
  if (val == null || String(val).trim() === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

/**
 * Query se common filters build karta hai
 * - isDeleted false
 * - isActive, branchId, itemCategory, itemType normalize
 * - organization scope apply (agar req.user.organizationId ho)
 * - For non-super admins: branch scoping by user's assigned branches when "__ALL__" selected
 */
export const buildAssetListFilter = (req) => {
  const q = req?.query || {};
  const filter = { isDeleted: false };

  // Handle fetchAll parameter - if true, don't filter by isActive
  if (q.fetchAll !== "true") {
    // Only filter by isActive if explicitly requested by frontend and fetchAll is not true
    if (q.isActive !== undefined) {
      filter.isActive = String(q.isActive) === "true";
    } else {
      // Default to active only if fetchAll is not specified
      filter.isActive = true;
    }
  }
  // If fetchAll=true, don't add isActive filter at all

  // Apply branch scoping
  // For super admins: no branch filter (see all branches)
  // For non-super admins:
  //   - If specific branchId: convert to ObjectId
  //   - If "__ALL__" or no branchId: show only from their assigned branches
  
  const isSuper = String(req.user?.role || "").toLowerCase() === "super_admin" || 
                  String(req.user?.role || "").toLowerCase() === "super admin";
  
  if (!isSuper) {
    // Get user's assigned branches
    const userBranchIds = Array.isArray(req.user?.branchId)
      ? req.user.branchId.map((b) => (typeof b === "object" && b?._id ? b._id : b))
      : [];

    if (q.branchId && q.branchId !== "__ALL__" && q.branchId !== "") {
      // Specific branch - convert string to ObjectId
      try {
        if (mongoose.Types.ObjectId.isValid(q.branchId)) {
          filter.branchId = new mongoose.Types.ObjectId(q.branchId);
        } else {
          filter.branchId = q.branchId;
        }
      } catch (err) {
        filter.branchId = q.branchId;
      }
    } else {
      // "__ALL__" or no branchId: show only from user's assigned branches
      if (userBranchIds.length > 0) {
        filter.branchId = { $in: userBranchIds };
      }
    }
  } else {
    // Super admin: convert branchId if provided
    if (q.branchId && q.branchId !== "__ALL__" && q.branchId !== "") {
      try {
        if (mongoose.Types.ObjectId.isValid(q.branchId)) {
          filter.branchId = new mongoose.Types.ObjectId(q.branchId);
        } else {
          filter.branchId = q.branchId;
        }
      } catch (err) {
        filter.branchId = q.branchId;
      }
    }
  }
  
  if (q.itemCategory) filter.itemCategory = q.itemCategory; // Now it's ObjectId, no need to normalize
  if (q.itemType) filter.itemType = norm(q.itemType).toLowerCase();
  if (req?.user?.organizationId) filter.organizationId = req.user.organizationId;
  return filter;
};

/**
 * Body se branchId nikalta hai (form compatibility)
 */
export const extractBranchIdFromBody = (body) => body?.branch || body?.branchId || null;

/**
 * Org and audit fields user se set karta hai
 */
export const ensureOrgAndAudit = (req) => ({
  organizationId: req.user?.organizationId || null,
  createdBy: req.user?._id || req.user?.id,
  updatedBy: null,
});

