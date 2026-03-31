/**
 * Laptop Asset Handler
 * Description: Laptop create/list/get logic, currently model-shared with CPU-like structure.
 * Creates 3 documents: Fixed Asset (asset_fixed), Purchase (asset_purchases), Warranty (asset_warranties)
 */
import { Laptop } from "../../../models/fixed/laptop.model.js";
import { Purchase } from "../../../models/purchase.model.js";
import { Warranty } from "../../../models/warranty.model.js";
import { norm, buildAssetListFilter, extractBranchIdFromBody, ensureOrgAndAudit } from "../../../utils/assetUtils.js";

const create = async (req) => {
  const body = req.body || {};
  const AssetType = norm(body.AssetType).toLowerCase();
  const AssetCategory = body.AssetCategory; // Now it's ObjectId, no need to normalize to string

  const memoryModules = body.memory?.ramModules || [];
  const storageDevices = body.storage?.storageDevices || [];
  const branchId = extractBranchIdFromBody(body);

  const validMemoryModules = memoryModules.filter((m) => m && (m.ramCapacityGB || m.ramManufacturer || m.ramModelNumber));
  const memory = {
    modules: validMemoryModules,
    totalQty: validMemoryModules.length,
    totalCapacityGB: validMemoryModules.reduce((sum, m) => sum + (Number(m.ramCapacityGB) || 0), 0),
  };

  const validStorageDevices = storageDevices.filter((d) => d && (d.driveCapacityGB || d.driveManufacturer || d.driveType));
  const storage = {
    devices: validStorageDevices,
    totalQty: validStorageDevices.length,
    totalCapacityGB: validStorageDevices.reduce((sum, d) => sum + (Number(d.driveCapacityGB) || 0), 0),
    typeBreakdown: [],
  };

  const typeMap = new Map();
  validStorageDevices.forEach((d) => {
    const type = norm(d.driveType) || "Unknown";
    const capacity = Number(d.driveCapacityGB) || 0;
    if (!typeMap.has(type)) typeMap.set(type, { type, qty: 0, capacityGB: 0 });
    const entry = typeMap.get(type);
    entry.qty += 1;
    entry.capacityGB += capacity;
  });
  storage.typeBreakdown = Array.from(typeMap.values());

  // Build Fixed Asset Payload (no purchase/warranty fields)
  const fixedPayload = {
    ...body,
    AssetCategory,
    AssetType,
    branchId,
    memory,
    storage,
    ...ensureOrgAndAudit(req),
  };

  delete fixedPayload.sections;
  delete fixedPayload.flat;
  delete fixedPayload.memoryModules;
  delete fixedPayload.storageDevices;

  // Purchase & Warranty field names to extract
  const purchaseFields = [
    "purchaseType", "poNumber", "poDate", "receiptNumber", "receiptDate", "purchaseDate",
    "vendorId", "assetReceivedOn", "invoiceNumber", "invoiceDate", "deliveryChallanNumber",
    "deliveryChallanDate", "purchaseCost", "taxAmount", "totalAmount", "currency",
    "deliveryDate", "receivedBy"
  ];
  
  const warrantyFields = [
    "warrantyAvailable", "warrantyMode", "inYear", "inMonth", "warrantyStartDate",
    "warrantyEndDate", "warrantyProvider", "supportVendor", "supportPhone", "supportEmail",
    "amcAvailable", "amcVendor", "amcStartDate", "amcEndDate"
  ];

  // Extract purchase data
  const purchaseData = {};
  purchaseFields.forEach(field => {
    if (body[field] !== undefined) {
      purchaseData[field] = body[field];
    }
  });

  // Extract warranty data
  const warrantyData = {};
  warrantyFields.forEach(field => {
    if (body[field] !== undefined) {
      warrantyData[field] = body[field];
    }
  });

  // Delete fields from fixedPayload
  [...purchaseFields, ...warrantyFields].forEach((k) => delete fixedPayload[k]);

  // 1. Save Fixed Asset first
  const fixedDoc = await Laptop.create(fixedPayload);
  const assetId = fixedDoc._id;

  // 2. Create Purchase Document if any purchase field exists
  let purchaseDoc = null;
  if (Object.keys(purchaseData).length > 0) {
    purchaseDoc = await Purchase.create({
      assetId,
      AssetCategory,
      AssetType,
      organizationId: fixedPayload.organizationId,
      branchId,
      ...purchaseData,
      createdBy: fixedPayload.createdBy,
    });
  }

  // 3. Create Warranty Document if any warranty field exists
  let warrantyDoc = null;
  if (Object.keys(warrantyData).length > 0) {
    warrantyDoc = await Warranty.create({
      assetId,
      AssetCategory,
      AssetType,
      organizationId: fixedPayload.organizationId,
      branchId,
      ...warrantyData,
      createdBy: fixedPayload.createdBy,
    });
  }

  return {
    doc: {
      fixedAsset: fixedDoc,
      purchase: purchaseDoc,
      warranty: warrantyDoc
    },
    message: "Asset created successfully."
  };
};

const list = async (req) => {
  const filter = buildAssetListFilter(req);
  // If caller provides a `limit` query param we'll paginate; otherwise return all matching items.
  const rawLimit = req.query?.limit !== undefined ? Number(req.query.limit) : 0;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.max(Math.floor(rawLimit), 0) : 0;
  const page = Math.max(Number(req.query?.page) || 1, 1);

  let query = Laptop.find(filter)
    .select("-__v")
    .sort({ createdAt: -1 });

  if (limit > 0) {
    query = query.skip((page - 1) * limit).limit(limit);
  }

  const items = await query.lean();

  const flattenedItems = items.map((item) => ({
    ...item,
    AssetName: item.AssetId || item.summary?.AssetName || "N/A",
    manufacturer: item.manufacturer || item.summary?.manufacturer || "N/A",
    model: item.model || item.summary?.model || "N/A",
    serialNumber: item.serialNumber || item.summary?.serialNumber || "N/A",
    AssetTag: item.AssetId || item.summary?.AssetTag || "N/A",
  }));

  return { items: flattenedItems, message: "Assets retrieved" };
};

const getById = async (req) => {
  const { id } = req.params;
  const doc = await Laptop.findById(id).lean();
  if (!doc || doc.isDeleted) {
    const e = new Error("Asset not found");
    e.statusCode = 404;
    throw e;
  }
  if (req.user?.organizationId && String(doc.organizationId) !== String(req.user.organizationId)) {
    const e = new Error("Access denied for this asset");
    e.statusCode = 403;
    throw e;
  }
  return { doc, message: "Asset retrieved" };
};

export default { create, list, getById };

