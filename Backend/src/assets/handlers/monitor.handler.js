/**
 * Monitor Asset Handler
 * Description: Monitor create/list/get logics. Simple fields normalize + numeric sanitization.
 */
import { Monitor } from "../../models/monitor.model.js";
import { norm, toNumberOrNull, buildAssetListFilter, extractBranchIdFromBody, ensureOrgAndAudit } from "../../utils/assetUtils.js";

const create = async (req) => {
  const body = req.body || {};
  const itemType = norm(body.itemType).toLowerCase();
  const itemCategory = norm(body.itemCategory || body.assetCategory || body.category).toLowerCase();

  const branchId = extractBranchIdFromBody(body);

  const payload = {
    ...body,
    itemCategory,
    itemType,
    branchId,
    screenSizeInches: toNumberOrNull(body.screenSizeInches),
    refreshRateHz: toNumberOrNull(body.refreshRateHz),
    brightnessNits: toNumberOrNull(body.brightnessNits),
    responseTimeMs: toNumberOrNull(body.responseTimeMs),
    hdmiPorts: toNumberOrNull(body.hdmiPorts),
    displayPort: toNumberOrNull(body.displayPort),
    usbPorts: toNumberOrNull(body.usbPorts),
    powerConsumptionWatt: toNumberOrNull(body.powerConsumptionWatt),
    ...ensureOrgAndAudit(req),
  };

  delete payload.sections;
  delete payload.flat;
  delete payload.memory;
  delete payload.storage;
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

  const doc = await Monitor.create(payload);
  return { doc, message: "Asset created successfully" };
};

const list = async (req) => {
  const filter = buildAssetListFilter(req);

  const limit = Math.min(Math.max(Number(req.query?.limit) || 20, 1), 100);
  const page = Math.max(Number(req.query?.page) || 1, 1);
  const items = await Monitor.find(filter)
    .select("itemId summary manufacturer model serialNumber itemCategory itemType isActive createdAt branchId organizationId isDeleted")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  const flattenedItems = items.map((item) => ({
    ...item,
    itemName: item.itemId || item.summary?.itemName || "N/A",
    manufacturer: item.manufacturer || item.summary?.manufacturer || "N/A",
    model: item.model || item.summary?.model || "N/A",
    serialNumber: item.serialNumber || item.summary?.serialNumber || "N/A",
    itemTag: item.itemId || item.summary?.itemTag || "N/A",
  }));

  return { items: flattenedItems, message: "Assets retrieved" };
};

const getById = async (req) => {
  const { id } = req.params;
  const doc = await Monitor.findById(id).lean();
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
