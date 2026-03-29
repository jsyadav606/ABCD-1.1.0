/**
 * Keyboard Asset Handler (Peripheral)
 * Description: Keyboard-specific create/list/getById logics.
 * Uses Keyboard model (asset_peripheral_keyboard collection).
 * Ready to be expanded with keyboard-specific fields and logic.
 */
import { Keyboard } from "../../../models/peripheral/keyboard.model.js";
import { Purchase } from "../../../models/purchase.model.js";
import { Warranty } from "../../../models/warranty.model.js";
import { norm, buildAssetListFilter, extractBranchIdFromBody, ensureOrgAndAudit } from "../../../utils/assetUtils.js";

const create = async (req) => {
  const body = req.body || {};
  const itemType = norm(body.itemType).toLowerCase();
  const itemCategory = body.itemCategory;
  const branchId = extractBranchIdFromBody(body);

  // Build Peripheral Asset Payload with all keyboard fields
  const fixedPayload = {
    itemCategory,
    itemType,
    branchId,
    
    // Basic Information
    itemId: body.itemId || null,
    itemTag: body.itemTag || null,
    barcode: body.barcode || null,
    itemSubType: body.itemSubType || null,
    manufacturer: body.manufacturer || null,
    model: body.model || null,
    modelNumber: body.modelNumber || null,
    partNumber: body.partNumber || null,
    serialNumber: body.serialNumber || null,
    ownershipType: body.ownershipType || null,
    manufacturingDate: body.manufacturingDate || null,

    // Location & Other Information
    location: body.location || null,
    locationType: body.locationType || null,
    building: body.building || null,
    floor: body.floor || null,
    room: body.room || null,
    rackNumber: body.rackNumber || null,
    rackUnit: body.rackUnit || null,

    // Keyboard-specific fields
    keyboardLayout: body.keyboardLayout || null,
    keyType: body.keyType || null,
    backlighting: body.backlighting || null,
    programmableKeys: body.programmableKeys !== undefined && body.programmableKeys !== null ? Number(body.programmableKeys) : null,
    connectionType: body.connectionType || null,
    cableLength: body.cableLength !== undefined && body.cableLength !== null ? Number(body.cableLength) : null,
    color: body.color || null,
    weight: body.weight !== undefined && body.weight !== null ? Number(body.weight) : null,

    // Item State
    itemStatus: body.itemStatus || "active",
    itemIsCurrently: body.itemIsCurrently || "inStore",
    itemUser: body.itemUser || null,
    AssignDate: body.AssignDate || null,

    // Organization & Audit
    ...ensureOrgAndAudit(req),
  };

  // Purchase field names to extract
  const purchaseFields = [
    "purchaseType", "poNumber", "poDate", "receiptNumber", "receiptDate", "purchaseDate",
    "vendorId", "itemReceivedOn", "invoiceNumber", "invoiceDate", "deliveryChallanNumber",
    "deliveryChallanDate", "purchaseCost", "taxAmount", "totalAmount", "currency",
    "deliveryDate", "receivedBy"
  ];
  
  // Warranty field names to extract
  const warrantyFields = [
    "warrantyAvailable", "warrantyMode", "inYear", "inMonth", "warrantyStartDate",
    "warrantyEndDate", "warrantyProvider", "supportVendor", "supportPhone", "supportEmail",
    "amcAvailable", "amcVendor", "amcStartDate", "amcEndDate"
  ];

  // Extract purchase data - Include all fields regardless of optional/required status
  const purchaseData = {};
  purchaseFields.forEach(field => {
    if (body[field] !== undefined) {
      purchaseData[field] = body[field];
    }
  });

  // Extract warranty data - Include all fields regardless of optional/required status
  const warrantyData = {};
  warrantyFields.forEach(field => {
    if (body[field] !== undefined) {
      warrantyData[field] = body[field];
    }
  });

  // 1️⃣ Save Peripheral Asset (Keyboard)
  const fixedDoc = await Keyboard.create(fixedPayload);
  const assetId = fixedDoc._id;

  // 2️⃣ Create Purchase Document if any purchase field exists
  let purchaseDoc = null;
  if (Object.keys(purchaseData).length > 0) {
    purchaseDoc = await Purchase.create({
      assetId,
      itemCategory,
      itemType,
      organizationId: fixedPayload.organizationId,
      branchId,
      ...purchaseData,
      createdBy: fixedPayload.createdBy,
    });
  }

  // 3️⃣ Create Warranty Document if any warranty field exists
  let warrantyDoc = null;
  if (Object.keys(warrantyData).length > 0) {
    warrantyDoc = await Warranty.create({
      assetId,
      itemCategory,
      itemType,
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
    message: "Keyboard asset created successfully."
  };
};

const list = async (req) => {
  const filter = buildAssetListFilter(req);

  const rawLimit = req.query?.limit !== undefined ? Number(req.query.limit) : 0;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.max(Math.floor(rawLimit), 0) : 0;
  const page = Math.max(Number(req.query?.page) || 1, 1);

  let query = Keyboard.find(filter)
    .select("-__v")
    .sort({ createdAt: -1 });

  if (limit > 0) {
    query = query.skip((page - 1) * limit).limit(limit);
  }

  const items = await query.lean();
  
  const flattenedItems = items.map((item) => ({
    ...item,
    itemName: item.itemId || item.summary?.itemName || "N/A",
    manufacturer: item.manufacturer || item.summary?.manufacturer || "N/A",
    model: item.model || item.summary?.model || "N/A",
    serialNumber: item.serialNumber || item.summary?.serialNumber || "N/A",
    itemTag: item.itemId || item.summary?.itemTag || "N/A",
  }));
  
  return { items: flattenedItems, message: "Keyboard assets retrieved" };
};

const getById = async (req) => {
  const { id } = req.params;
  const doc = await Keyboard.findById(id).lean();
  
  if (!doc || doc.isDeleted) {
    const e = new Error("Keyboard asset not found");
    e.statusCode = 404;
    throw e;
  }
  
  if (req.user?.organizationId && String(doc.organizationId) !== String(req.user.organizationId)) {
    const e = new Error("Access denied for this asset");
    e.statusCode = 403;
    throw e;
  }
  
  return { doc, message: "Keyboard asset retrieved" };
};

export default { create, list, getById };
