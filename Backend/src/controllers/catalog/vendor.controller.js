import { Vendor } from "../../models/catalog/vendor.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";

export const createVendor = asyncHandler(async (req, res) => {
  const {
    code,
    name,
    email,
    phone,
    website,
    gstNumber,
    panNumber,
    address,
    billingAddress,
    shippingAddress,
    contacts,
    tags,
    notes,
    isActive,
    organizationId,
  } = req.body;

  if (!name || !String(name).trim()) {
    throw new apiError(400, "Vendor name is required");
  }

  const vendor = await Vendor.create({
    code,
    name: String(name).trim(),
    email,
    phone,
    website,
    gstNumber,
    panNumber,
    address,
    billingAddress,
    shippingAddress,
    contacts: Array.isArray(contacts) ? contacts : [],
    tags: Array.isArray(tags) ? tags : [],
    notes,
    isActive: isActive !== undefined ? !!isActive : true,
    organizationId: organizationId || req.user?.organizationId || null,
    createdBy: req.user?.id,
  });

  return res.status(201).json(new apiResponse(201, vendor, "Vendor created successfully"));
});

export const listVendors = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    q,
    isActive,
    includeDeleted = false,
  } = req.query;

  const filter = {};
  if (!includeDeleted || includeDeleted === "false") {
    filter.isDeleted = false;
  }
  if (isActive !== undefined) {
    filter.isActive = String(isActive) === "true";
  }

  // Tenant scope (optional)
  if (req.user?.organizationId) {
    filter.organizationId = req.user.organizationId;
  }

  if (q && String(q).trim()) {
    const query = String(q).trim();
    filter.$or = [
      { name: new RegExp(query, "i") },
      { code: new RegExp(query, "i") },
      { email: new RegExp(query, "i") },
      { phone: new RegExp(query, "i") },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Vendor.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }).lean(),
    Vendor.countDocuments(filter),
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, { items, meta: { page: Number(page), limit: Number(limit), total } }, "Vendors retrieved")
    );
});

export const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findById(id).lean();
  if (!vendor || vendor.isDeleted) {
    throw new apiError(404, "Vendor not found");
  }
  return res.status(200).json(new apiResponse(200, vendor, "Vendor retrieved"));
});

export const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updatedBy: req.user?.id };
  const vendor = await Vendor.findById(id);
  if (!vendor || vendor.isDeleted) {
    throw new apiError(404, "Vendor not found");
  }
  Object.assign(vendor, updates);
  await vendor.save();
  return res.status(200).json(new apiResponse(200, vendor, "Vendor updated successfully"));
});

export const softDeleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findById(id);
  if (!vendor || vendor.isDeleted) {
    throw new apiError(404, "Vendor not found");
  }
  vendor.isDeleted = true;
  vendor.deletedAt = new Date();
  vendor.deletedBy = req.user?.id || null;
  await vendor.save();
  return res.status(200).json(new apiResponse(200, { id: vendor._id }, "Vendor deleted"));
});

export const toggleVendorActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findById(id);
  if (!vendor || vendor.isDeleted) {
    throw new apiError(404, "Vendor not found");
  }
  vendor.isActive = !vendor.isActive;
  vendor.updatedBy = req.user?.id || null;
  await vendor.save();
  return res
    .status(200)
    .json(new apiResponse(200, { id: vendor._id, isActive: vendor.isActive }, "Vendor status updated"));
});

export const getVendorsForDropdown = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false, isActive: true };
  if (req.user?.organizationId) filter.organizationId = req.user.organizationId;
  const items = await Vendor.find(filter).select("name code").sort({ name: 1 }).lean();
  const data = items.map((v) => ({ value: v._id, label: v.name, code: v.code || null }));
  return res.status(200).json(new apiResponse(200, data, "Vendor dropdown"));
});

