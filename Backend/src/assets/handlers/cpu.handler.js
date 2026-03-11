import { CPU } from "../../models/cpu.model.js";

const norm = (val) => (val == null ? "" : String(val).trim());

const findSection = (sections, name, kind) => {
  const list = Array.isArray(sections) ? sections : [];
  const nm = norm(name).toLowerCase();
  return list.find((s) => {
    if (!s || typeof s !== "object") return false;
    if (norm(s.name).toLowerCase() !== nm) return false;
    if (!kind) return true;
    return norm(s.kind).toLowerCase() === norm(kind).toLowerCase();
  });
};

const extractBranchId = (payload, sections) => {
  const direct =
    payload?.branchId ??
    payload?.branch ??
    payload?.location?.branchId ??
    payload?.location?.branch ??
    payload?.locationInformation?.branch ??
    null;
  if (direct) return direct;
  const loc = findSection(sections, "Location Information", "group") || findSection(sections, "Location", "group");
  const b = loc?.data?.branch ?? loc?.data?.branchId ?? null;
  return b || null;
};

const create = async (req) => {
  const itemType = norm(req.body?.itemType).toLowerCase();
  const itemCategory = norm(req.body?.itemCategory || req.body?.assetCategory || req.body?.category).toLowerCase();
  const sections = Array.isArray(req.body?.sections) ? req.body.sections : [];
  const { sections: _omit, ...flat } = req.body || {};

  const payload = {
    itemCategory,
    itemType,
    sections,
    flat,
    organizationId: req.user?.organizationId || null,
    branchId: extractBranchId(req.body, sections),
    createdBy: req.user?._id || req.user?.id,
    updatedBy: null,
  };

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
  const flattenedItems = items.map((item) => ({
    ...item,
    itemName: item.summary?.itemName || item.flat?.itemName || null,
    manufacturer: item.summary?.manufacturer || item.flat?.manufacturer || item.flat?.cpuManufacturer || null,
    model: item.summary?.model || item.flat?.model || item.flat?.cpuModel || null,
    serialNumber: item.summary?.serialNumber || item.flat?.serialNumber || null,
    itemTag: item.summary?.itemTag || item.flat?.itemTag || item.flat?.assetTag || null,
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
  const flattenedDoc = {
    ...doc,
    itemName: doc.summary?.itemName || doc.flat?.itemName || null,
    manufacturer: doc.summary?.manufacturer || doc.flat?.manufacturer || doc.flat?.cpuManufacturer || null,
    model: doc.summary?.model || doc.flat?.model || doc.flat?.cpuModel || null,
    serialNumber: doc.summary?.serialNumber || doc.flat?.serialNumber || null,
    itemTag: doc.summary?.itemTag || doc.flat?.itemTag || doc.flat?.assetTag || null,
  };
  return { doc: flattenedDoc, message: "Asset retrieved" };
};

export default { create, list, getById };

