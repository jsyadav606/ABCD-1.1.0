/**
 * CPU Asset Handler
 * Description: CPU-specific create/list/get logics. Frontend AddItem.jsx ke payload ko normalize karke
 * memory/storage/network summaries banata hai taa ki queries fast aur UI mapping simple rahe.
 */
import { CPU } from "../../models/cpu.model.js";
import { norm, buildAssetListFilter, extractBranchIdFromBody, ensureOrgAndAudit } from "../../utils/assetUtils.js";

const create = async (req) => {
  const body = req.body || {};
  const itemType = norm(body.itemType).toLowerCase();
  const itemCategory = norm(body.itemCategory || body.assetCategory || body.category).toLowerCase();
  
  // Extract tables from payload prepared by AddItem.jsx
  const memoryModules = body.memory?.ramModules || [];
  const storageDevices = body.storage?.storageDevices || [];
  
  // Extract Network Details from sections if present (since it's a table in frontend)
  const sections = Array.isArray(body.sections) ? body.sections : [];
  const networkSection = sections.find(s => norm(s.name).toLowerCase() === "network details" && s.kind === "rows");
  const networkDetails = networkSection?.rows || [];

  // Form se branchId map karo
  const branchId = extractBranchIdFromBody(body);

  // Calculate Memory Aggregation
  const validMemoryModules = memoryModules.filter(m => m && (m.ramCapacityGB || m.ramManufacturer || m.ramModelNumber));
  const memory = {
    modules: validMemoryModules,
    totalQty: validMemoryModules.length,
    totalCapacityGB: validMemoryModules.reduce((sum, m) => sum + (Number(m.ramCapacityGB) || 0), 0)
  };

  // Calculate Storage Aggregation
  const validStorageDevices = storageDevices.filter(d => d && (d.driveCapacityGB || d.driveManufacturer || d.driveType));
  const storage = {
    devices: validStorageDevices,
    totalQty: validStorageDevices.length,
    totalCapacityGB: validStorageDevices.reduce((sum, d) => sum + (Number(d.driveCapacityGB) || 0), 0),
    typeBreakdown: []
  };

  // Build Storage Type Breakdown
  const typeMap = new Map();
  validStorageDevices.forEach(d => {
    const type = norm(d.driveType) || "Unknown";
    const capacity = Number(d.driveCapacityGB) || 0;
    if (!typeMap.has(type)) {
      typeMap.set(type, { type, qty: 0, capacityGB: 0 });
    }
    const entry = typeMap.get(type);
    entry.qty += 1;
    entry.capacityGB += capacity;
  });
  storage.typeBreakdown = Array.from(typeMap.values());

  // Calculate Network Aggregation
  const validInterfaces = networkDetails.filter(i => i && (i.nicType || i.macAddress || i.ipv4Address));
  const network = {
    interfaces: validInterfaces,
    totalQty: validInterfaces.length,
    typeBreakdown: []
  };

  // Build Network Type Breakdown
  const netTypeMap = new Map();
  validInterfaces.forEach(i => {
    const type = norm(i.nicType) || "Unknown";
    if (!netTypeMap.has(type)) {
      netTypeMap.set(type, { nicType: type, qty: 0 });
    }
    const entry = netTypeMap.get(type);
    entry.qty += 1;
  });
  network.typeBreakdown = Array.from(netTypeMap.values());

  const payload = {
    ...body, // Includes all flat fields from 'form' spread in AddItem.jsx
    itemCategory,
    itemType,
    branchId,
    memory,
    storage,
    network,
    ...ensureOrgAndAudit(req),
  };

  // Remove fields that shouldn't be saved directly or are handled specifically
  delete payload.sections;
  delete payload.flat;
  delete payload.memoryModules;
  delete payload.storageDevices;
  delete payload.networkDetails;

  [
    "purchaseType",
    "poNumber",
    "poDate",
    "receiptNumber",
    "receiptDate",
    "purchaseDate",
    "vendorId",
    "itemReceivedOn",
    "invoiceNumber",
    "invoiceDate",
    "deliveryChallanNumber",
    "deliveryChallanDate",
    "purchaseCost",
    "taxAmount",
    "totalAmount",
    "currency",
    "deliveryDate",
    "receivedBy",
    "warrantyAvailable",
    "warrantyMode",
    "inYear",
    "inMonth",
    "warrantyStartDate",
    "warrantyEndDate",
    "warrantyProvider",
    "supportVendor",
    "supportPhone",
    "supportEmail",
    "amcAvailable",
    "amcVendor",
    "amcStartDate",
    "amcEndDate",
  ].forEach((k) => delete payload[k]);

  const doc = await CPU.create(payload);
  return { doc, message: "Asset created successfully" };
};

const list = async (req) => {
  // Centralized filter builder (isDeleted, isActive, org scope, branch, type/category)
  const filter = buildAssetListFilter(req);

  const limit = Math.min(Math.max(Number(req.query?.limit) || 20, 1), 100);
  const page = Math.max(Number(req.query?.page) || 1, 1);
  const items = await CPU.find(filter)
    .select("itemId summary manufacturer cpuManufacturer model cpuModel serialNumber itemCategory itemType isActive createdAt branchId organizationId isDeleted")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  
  // Map fields for UI consistency
  const flattenedItems = items.map((item) => ({
    ...item,
    itemName: item.itemId || item.summary?.itemName || "N/A",
    manufacturer: item.manufacturer || item.cpuManufacturer || item.summary?.manufacturer || "N/A",
    model: item.model || item.cpuModel || item.summary?.model || "N/A",
    serialNumber: item.serialNumber || item.summary?.serialNumber || "N/A",
    itemTag: item.itemId || item.summary?.itemTag || "N/A",
  }));
  return { items: flattenedItems, message: "Assets retrieved" };
};

const getById = async (req) => {
  const { id } = req.params;
  const doc = await CPU.findById(id).lean();
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
