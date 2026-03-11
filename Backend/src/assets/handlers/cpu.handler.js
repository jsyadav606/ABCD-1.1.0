import { CPU } from "../../models/cpu.model.js";

const norm = (val) => (val == null ? "" : String(val).trim());

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

  // Map branch from form to branchId
  const branchId = body.branch || body.branchId || null;

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
    organizationId: req.user?.organizationId || null,
    createdBy: req.user?._id || req.user?.id,
    updatedBy: null,
  };

  // Remove fields that shouldn't be saved directly or are handled specifically
  delete payload.sections;
  delete payload.flat;
  delete payload.memoryModules;
  delete payload.storageDevices;
  delete payload.networkDetails;

  const doc = await CPU.create(payload);
  return { doc, message: "Asset created successfully" };
};

const list = async (req) => {
  const { isActive, branchId, itemCategory, itemType } = req.query;
  const filter = { isDeleted: false };
  if (isActive !== undefined) filter.isActive = String(isActive) === "true";
  if (branchId) filter.branchId = branchId;
  if (itemCategory) filter.itemCategory = norm(itemCategory).toLowerCase();
  if (itemType) filter.itemType = norm(itemType).toLowerCase();
  if (req.user?.organizationId) filter.organizationId = req.user.organizationId;

  const items = await CPU.find(filter).sort({ createdAt: -1 }).lean();
  
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
