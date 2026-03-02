import { AssetTemplate } from "../models/assetTemplate.model.js";
import { AssetItem } from "../models/assetItem.model.js";
import { Branch } from "../models/branch.model.js";
import { FieldCatalog } from "../models/fieldCatalog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const validateFieldValue = (field, value) => {
  if (field.required && (value === null || value === undefined || value === "")) {
    return { ok: false, message: `${field.label} is required` };
  }
  if (value === null || value === undefined || value === "") {
    return { ok: true };
  }
  switch (field.type) {
    case "text":
      if (typeof value !== "string") return { ok: false, message: `${field.label} must be a string` };
      break;
    case "number":
    case "integer":
    case "currency":
      if (typeof value !== "number") return { ok: false, message: `${field.label} must be a number` };
      if (field.type === "integer" && !Number.isInteger(value)) return { ok: false, message: `${field.label} must be an integer` };
      break;
    case "date":
    case "datetime":
      if (isNaN(Date.parse(value))) return { ok: false, message: `${field.label} must be a valid date` };
      break;
    case "duration":
      if (typeof value !== "number") return { ok: false, message: `${field.label} must be a duration number` };
      break;
    case "select":
      if (typeof value !== "string") return { ok: false, message: `${field.label} must be a string` };
      if (Array.isArray(field.options) && field.options.length > 0) {
        const allowed = field.options.map((o) => o.value);
        if (!allowed.includes(String(value))) return { ok: false, message: `${field.label} has invalid option` };
      }
      break;
    case "multiselect":
      if (!Array.isArray(value)) return { ok: false, message: `${field.label} must be an array` };
      break;
    case "boolean":
      if (typeof value !== "boolean") return { ok: false, message: `${field.label} must be boolean` };
      break;
    case "file":
      if (typeof value !== "string") return { ok: false, message: `${field.label} must be a file reference` };
      break;
    case "reference":
      if (typeof value !== "string") return { ok: false, message: `${field.label} must be a reference id` };
      break;
    case "computed":
      break;
    default:
      return { ok: false, message: `${field.label} has unknown type` };
  }
  return { ok: true };
};

export const createTemplate = asyncHandler(async (req, res) => {
  const { name, category, visibility, organizationId, allowedBranchIds, fields, catalogKeys = [], schemaJson } = req.body;
  if (!name || !category) throw new apiError(400, "name and category are required");
  if ((!Array.isArray(fields) || fields.length === 0) && (!Array.isArray(catalogKeys) || catalogKeys.length === 0)) {
    throw new apiError(400, "At least one field or catalog key is required");
  }

  let normFields = [];
  const allowedTypes = [
    "text","number","integer","currency","date","datetime","duration","select","multiselect","boolean","file","reference","computed"
  ];

  if (Array.isArray(fields) && fields.length > 0) {
    normFields = fields.map((f) => ({
      key: String(f.key || "").trim().toLowerCase(),
      label: String(f.label || "").trim(),
      type: String(f.type || "").trim(),
      widget: f.widget || null,
      required: !!f.required,
      defaultValue: f.defaultValue ?? null,
      validations: f.validations || {},
      options: Array.isArray(f.options) ? f.options : [],
      conditionalRules: f.conditionalRules || {},
      section: f.section || null,
      auditable: !!f.auditable,
      primary: !!f.primary,
    }));
  } else if (Array.isArray(catalogKeys) && catalogKeys.length > 0) {
    const keys = catalogKeys.map((k) => String(k).trim().toLowerCase());
    const docs = await FieldCatalog.find({ key: { $in: keys }, isActive: true }).lean();
    if (!docs || docs.length === 0) throw new apiError(400, "No catalog fields found");
    normFields = docs.map((d) => ({
      key: String(d.key).trim().toLowerCase(),
      label: String(d.label).trim(),
      type: String(d.type).trim(),
      widget: null,
      required: false,
      defaultValue: null,
      validations: Object.fromEntries(d.validations || []),
      options: Array.isArray(d.options) ? d.options : [],
      conditionalRules: {},
      section: null,
      auditable: false,
      primary: false,
    }));
  }

  const keys = normFields.map((f) => f.key);
  if (keys.some((k) => !k)) throw new apiError(400, "All fields must have a non-empty key");
  if (normFields.some((f) => !f.label)) throw new apiError(400, "All fields must have a label");
  if (normFields.some((f) => !allowedTypes.includes(f.type))) {
    throw new apiError(400, "Invalid field type detected");
  }
  const unique = new Set(keys);
  if (unique.size !== keys.length) throw new apiError(400, "Duplicate field keys are not allowed");

  try {
    const doc = await AssetTemplate.create({
      name,
      category,
      visibility: visibility || "global",
      organizationId: organizationId || null,
      allowedBranchIds: Array.isArray(allowedBranchIds) ? allowedBranchIds : [],
      status: "Draft",
      version: 1,
      fields: normFields,
      schemaJson: schemaJson || {},
      createdBy: req.user.id,
    });
    return res.status(201).json(new apiResponse(201, doc, "Template created"));
  } catch (err) {
    throw new apiError(400, err.message || "Failed to create template");
  }
});

export const publishTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tpl = await AssetTemplate.findById(id);
  if (!tpl || tpl.isDeleted) throw new apiError(404, "Template not found");
  tpl.status = "Published";
  tpl.version = (tpl.version || 1);
  tpl.updatedBy = req.user.id;
  await tpl.save();
  return res.status(200).json(new apiResponse(200, tpl, "Template published"));
});

export const listCatalogFields = asyncHandler(async (req, res) => {
  const { q, tag } = req.query;
  const filter = { isActive: true };
  if (tag) filter.tags = tag;
  if (q && String(q).trim()) {
    filter.$or = [
      { key: new RegExp(String(q).trim(), "i") },
      { label: new RegExp(String(q).trim(), "i") },
    ];
  }
  const items = await FieldCatalog.find(filter).sort({ label: 1 }).lean();
  return res.status(200).json(new apiResponse(200, items, "Catalog fields retrieved"));
});

export const createCatalogField = asyncHandler(async (req, res) => {
  const { key, label, type, validations, options, tags } = req.body;
  if (!key || !label || !type) throw new apiError(400, "key, label, type are required");
  const allowed = [
    "text","number","integer","currency","date","datetime","duration","select","multiselect","boolean","file","reference","computed"
  ];
  if (!allowed.includes(String(type).trim())) throw new apiError(400, "Invalid field type");
  const doc = await FieldCatalog.create({
    key: String(key).trim().toLowerCase(),
    label: String(label).trim(),
    type: String(type).trim(),
    validations: validations || {},
    options: Array.isArray(options) ? options : [],
    tags: Array.isArray(tags) ? tags : [],
    createdBy: req.user.id,
  });
  return res.status(201).json(new apiResponse(201, doc, "Catalog field created"));
});

export const updateTemplate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tpl = await AssetTemplate.findById(id);
  if (!tpl || tpl.isDeleted) throw new apiError(404, "Template not found");
  const up = req.body || {};
  if (typeof up.name === "string") tpl.name = up.name;
  if (typeof up.category === "string") tpl.category = up.category;
  if (typeof up.visibility === "string") tpl.visibility = up.visibility;
  if (up.allowedBranchIds) tpl.allowedBranchIds = Array.isArray(up.allowedBranchIds) ? up.allowedBranchIds : [];
  if (Array.isArray(up.fields)) {
    tpl.fields = up.fields;
    tpl.version = (tpl.version || 1) + 1;
  }
  if (up.schemaJson && typeof up.schemaJson === "object") tpl.schemaJson = up.schemaJson;
  tpl.updatedBy = req.user.id;
  await tpl.save();
  return res.status(200).json(new apiResponse(200, tpl, "Template updated"));
});

export const getTemplateById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tpl = await AssetTemplate.findById(id).lean();
  if (!tpl || tpl.isDeleted) throw new apiError(404, "Template not found");
  return res.status(200).json(new apiResponse(200, tpl, "Template retrieved"));
});

export const listTemplates = asyncHandler(async (req, res) => {
  const filter = { isDeleted: false };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  const items = await AssetTemplate.find(filter).sort({ createdAt: -1 }).lean();
  return res.status(200).json(new apiResponse(200, items, "Templates retrieved"));
});

export const createItem = asyncHandler(async (req, res) => {
  const { templateId, branchId, ownerId, name, values, status } = req.body;
  if (!templateId || !branchId) throw new apiError(400, "templateId and branchId are required");
  const tpl = await AssetTemplate.findById(templateId).lean();
  if (!tpl || tpl.isDeleted || tpl.status !== "Published") throw new apiError(400, "Template is not available");
  const branch = await Branch.findById(branchId).lean();
  if (!branch) throw new apiError(404, "Branch not found");
  if (tpl.visibility === "branch" && Array.isArray(tpl.allowedBranchIds) && tpl.allowedBranchIds.length > 0) {
    const allowed = tpl.allowedBranchIds.map((b) => String(b));
    if (!allowed.includes(String(branchId))) throw new apiError(403, "Template not visible to branch");
  }
  const vals = Array.isArray(values) ? values : [];
  const byKey = new Map(vals.map((v) => [String(v.fieldKey).toLowerCase(), v.value]));
  for (const field of tpl.fields || []) {
    const key = String(field.key).toLowerCase();
    const value = byKey.has(key) ? byKey.get(key) : field.defaultValue ?? null;
    const resVal = validateFieldValue(field, value);
    if (!resVal.ok) throw new apiError(400, resVal.message);
  }
  const doc = await AssetItem.create({
    templateId,
    templateVersion: tpl.version || 1,
    branchId,
    ownerId: ownerId || null,
    name: name || "",
    category: tpl.category,
    status: status || "IN_STOCK",
    values: vals,
    createdBy: req.user.id,
  });
  return res.status(201).json(new apiResponse(201, doc, "Asset created"));
});

export const listItems = asyncHandler(async (req, res) => {
  const { tab, branchId } = req.query;
  const filter = { isDeleted: false };
  if (tab && tab !== "ALL") filter.category = tab;
  if (branchId) filter.branchId = branchId;
  const items = await AssetItem.find(filter).sort({ createdAt: -1 }).lean();
  return res.status(200).json(new apiResponse(200, items, "Assets retrieved"));
});
