/**
 * Camera Peripheral Handler
 * Description: Camera-specific create/list/getById logics. 
 * Handles all camera fields from frontend and creates Fixed Asset, Purchase, and Warranty documents.
 * All optional fields are preserved in the fixed asset document.
 */
import { Camera } from "../../../models/peripheral/camera.model.js";
import { Purchase } from "../../../models/purchase.model.js";
import { Warranty } from "../../../models/warranty.model.js";
import { norm, buildAssetListFilter, extractBranchIdFromBody, ensureOrgAndAudit } from "../../../utils/assetUtils.js";

const create = async (req) => {
  const body = req.body || {};
  const AssetType = norm(body.AssetType).toLowerCase();
  const AssetCategory = body.AssetCategory;

  // Extract branch ID from payload
  const branchId = extractBranchIdFromBody(body);

  // Build Fixed Asset Payload with all camera fields
  const fixedPayload = {
    // Basic fields
    AssetCategory,
    AssetType,
    branchId,
    
    // Basic Information
    AssetId: body.AssetId || null,
    AssetTag: body.AssetTag || null,
    barcode: body.barcode || null,
    assetSubType: body.assetSubType || null,
    manufacturer: body.manufacturer || null,
    model: body.model || null,
    modelNumber: body.modelNumber || null,
    partNumber: body.partNumber || null,
    serialNumber: body.serialNumber || null,
    ownershipType: body.ownershipType || null,
    manufacturingDate: body.manufacturingDate || null,

    // Camera Type
    cameraType: body.cameraType || null,

    

    // Camera Specifications
    resolution: body.resolution || null,
    frameRate: body.frameRate !== undefined && body.frameRate !== null ? Number(body.frameRate) : null,
    sensorType: body.sensorType || null,
    fieldOfView: body.fieldOfView !== undefined && body.fieldOfView !== null ? Number(body.fieldOfView) : null,
    autoFocus: body.autoFocus || null,

    // Audio Features
    builtInMicrophone: body.builtInMicrophone || null,
    microphoneType: body.microphoneType || null,
    noiseReduction: body.noiseReduction || null,

    // Connectivity
    connectionType: body.connectionType || null,
    cableLength: body.cableLength !== undefined && body.cableLength !== null ? Number(body.cableLength) : null,
    plugAndPlay: body.plugAndPlay || null,

    // Mounting & Physical
    mountType: body.mountType || null,
    color: body.color || null,
    weight: body.weight !== undefined && body.weight !== null ? Number(body.weight) : null,

    // Item State
    AssetStatus: body.AssetStatus || "active",
    assetIsCurrently: body.assetIsCurrently || "inStore",
    AssetUser: body.AssetUser || null,
    AssignDate: body.AssignDate || null,

    // Organization & Audit
    ...ensureOrgAndAudit(req),
  };

  // Purchase field names to extract
  const purchaseFields = [
    "purchaseType", "poNumber", "poDate", "receiptNumber", "receiptDate", "purchaseDate",
    "vendorId", "assetReceivedOn", "invoiceNumber", "invoiceDate", "deliveryChallanNumber",
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

  // 1. Save Fixed Asset (Camera)
  const fixedDoc = await Camera.create(fixedPayload);
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
    message: "Camera asset created successfully."
  };
};

const list = async (req) => {
  // Centralized filter builder (isDeleted, isActive, org scope, branch, type/category)
  const filter = buildAssetListFilter(req);

  // Pagination support
  const rawLimit = req.query?.limit !== undefined ? Number(req.query.limit) : 0;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.max(Math.floor(rawLimit), 0) : 0;
  const page = Math.max(Number(req.query?.page) || 1, 1);

  let query = Camera.find(filter)
    .select("-__v")
    .sort({ createdAt: -1 });

  if (limit > 0) {
    query = query.skip((page - 1) * limit).limit(limit);
  }

  const items = await query.lean();
  
  // Map fields for UI consistency
  const flattenedItems = items.map((item) => ({
    ...item,
    AssetName: item.AssetId || item.summary?.AssetName || "N/A",
    manufacturer: item.manufacturer || item.summary?.manufacturer || "N/A",
    model: item.model || item.summary?.model || "N/A",
    serialNumber: item.serialNumber || item.summary?.serialNumber || "N/A",
    AssetTag: item.AssetId || item.summary?.AssetTag || "N/A",
  }));
  
  return { items: flattenedItems, message: "Camera assets retrieved" };
};

const getById = async (req) => {
  const { id } = req.params;
  const doc = await Camera.findById(id).lean();
  
  if (!doc || doc.isDeleted) {
    const e = new Error("Camera asset not found");
    e.statusCode = 404;
    throw e;
  }
  
  if (req.user?.organizationId && String(doc.organizationId) !== String(req.user.organizationId)) {
    const e = new Error("Access denied for this asset");
    e.statusCode = 403;
    throw e;
  }
  
  return { doc, message: "Camera asset retrieved" };
};

export default { create, list, getById };

