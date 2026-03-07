import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { CPU } from "../models/cpu.model.js";

const pickBaseFields = (body = {}) => {
  const baseKeys = [
    "itemType",
    "assetName",
    "manufacturer",
    "model",
    "serialNumber",
    "assetTag",
    "barcode",
    "purchaseCost",
    "acquisitionDate",
    "warrantyExpiryDate",
    "location",
    "lifecycleStatus",
    "operationalStatus",
    "remarks",
    "branchId",
    "assignedToUserId",
  ];
  const base = {};
  for (const k of baseKeys) {
    if (body[k] !== undefined) base[k] = body[k];
  }
  return base;
};

export const createAsset = asyncHandler(async (req, res) => {
  const { itemType } = req.body;
  if (!itemType || !String(itemType).trim()) {
    throw new apiError(400, "itemType is required");
  }

  const normalizedType = String(itemType).trim().toLowerCase();

  if (normalizedType === "cpu") {
    const v = (val) => {
      if (val === undefined || val === null) return null;
      return typeof val === "string" ? val.trim() : val;
    };
    const toBool = (val) => {
      if (val === undefined || val === null) return false;
      if (typeof val === "boolean") return val;
      const s = String(val).toLowerCase();
      return s === "yes" || s === "true" || s === "1";
    };
    const toNum = (val) => (val == null || val === "" ? null : Number(val));
    const collectIndexed = (body, fieldMap) => {
      const byIndex = new Map();
      Object.keys(body || {}).forEach((key) => {
        const m = key.match(/_(\d+)$/);
        if (!m) return;
        const base = key.slice(0, key.lastIndexOf("_"));
        const idx = Number(m[1]);
        if (!Object.prototype.hasOwnProperty.call(fieldMap, base)) return;
        if (!byIndex.has(idx)) byIndex.set(idx, {});
        byIndex.get(idx)[fieldMap[base].name] = fieldMap[base].transform
          ? fieldMap[base].transform(body[key])
          : body[key];
      });
      return Array.from(byIndex.keys())
        .sort((a, b) => a - b)
        .map((i) => byIndex.get(i))
        .filter((obj) => Object.values(obj).some((v) => v !== null && String(v).trim() !== ""));
    };

    const cpuPayload = {
      itemType: "cpu",
      
      basicInfo: {
        assetName: v(req.body.assetName),
        assetCategory: v(req.body.assetCategory || req.body.category),
        manufacturer: v(req.body.manufacturer),
        model: v(req.body.model),
        deviceType: v(req.body.deviceType),
        assetTag: v(req.body.assetTag),
        serialNumber: v(req.body.serialNumber),
        description: v(req.body.remarks), // Mapping remarks to description if needed, or keep remarks in lifecycle
      },

      operatingSystem: {
        osName: v(req.body.osName),
        osEdition: v(req.body.osEdition),
        osVersion: v(req.body.osVersion),
        buildNumber: v(req.body.buildNumber),
        osLicenseKey: v(req.body.osLicenseKey),
        activationStatus: v(req.body.activationStatus),
      },
      processor: {
        cpuModel: v(req.body.cpuModel),
        cpuManufacturer: v(req.body.cpuManufacturer),
        clockSpeedGHz: toNum(req.body.clockSpeedGHz),
        cores: toNum(req.body.cores),
        threads: toNum(req.body.threads),
        virtualizationEnabled: toBool(req.body.virtualizationEnabled),
        cpuSocket: v(req.body.cpuSocket),
        memoryTypeSupported: v(req.body.memoryTypeSupported),
        maxMemoryCapacityGB: toNum(req.body.maxMemoryCapacityGB),
        maxMemorySpeedMHz: toNum(req.body.maxMemorySpeedMHz),
        pcieGenSupported: v(req.body.pcieGenSupported),
      },
      
      connectivity: {
        hostname: v(req.body.hostname),
        domain: v(req.body.domain),
        ipAddress: v(req.body.ipAddress),
        macAddress: v(req.body.macAddress),
        nicType: v(req.body.nicType),
        vlan: v(req.body.vlan),
        dhcpEnabled: toBool(req.body.dhcpEnabled),
        dnsHostname: v(req.body.dnsHostname),
      },

      security: {
        biosVersion: v(req.body.biosVersion),
        biosDate: req.body.biosDate || null,
        motherboardSerial: v(req.body.motherboardSerial),
        hardwareUUID: v(req.body.hardwareUUID),
        tpmVersion: v(req.body.tpmVersion),
        secureBootEnabled: toBool(req.body.secureBootEnabled),
        encryptionEnabled: toBool(req.body.encryptionEnabled),
      },

      lifecycle: {
        status: v(req.body.lifecycleStatus),
        operationalStatus: v(req.body.operationalStatus),
        acquisitionDate: req.body.acquisitionDate || null,
        warrantyExpiryDate: req.body.warrantyExpiryDate || null,
        purchaseCost: toNum(req.body.purchaseCost),
        vendor: v(req.body.vendor),
        depreciationMethod: v(req.body.depreciationMethod),
        usefulLifeYears: toNum(req.body.usefulLifeYears),
        residualValue: toNum(req.body.residualValue),
        lastAuditDate: req.body.lastAuditDate || null,
      },

      location: {
        branch: req.body.branchId || req.body.branch || null,
        building: v(req.body.building),
        floor: v(req.body.floor),
        room: v(req.body.room),
        assignedTo: req.body.assignedTo || null,
        assignmentDate: req.body.assignmentDate || null,
      },

      organizationId: req.user?.organizationId || null,
      branchId: req.body.branchId || req.body.branch || null,
      createdBy: req.user?._id || req.user?.id,
      updatedBy: null,
    };

    // Handle memory (same as before but without totalRamGB root field)
    if (req.body.memory) {
      cpuPayload.memory = req.body.memory;
      if (Array.isArray(cpuPayload.memory?.ramModules)) {
        cpuPayload.memory.totalNoOfMemory =
          cpuPayload.memory.totalNoOfMemory ??
          (cpuPayload.memory.ramModules.filter(
            (m) => Number(m?.capacityGB) > 0 || (m?.modelNumber && String(m.modelNumber).trim())
          ).length ||
          null);
      }
    } else {
      const ramRows = collectIndexed(req.body, {
        ramManufacturer: { name: "manufacturer" },
        ramModelNumber: { name: "modelNumber" },
        ramCapacityGB: { name: "capacityGB", transform: toNum },
        ramType: { name: "type" },
        ramSpeedMHz: { name: "speedMHz", transform: toNum },
        ramFormFactor: { name: "formFactor" },
        ramSlot: { name: "slot" },
        ramChannel: { name: "channel" },
      });
      if (ramRows.length) {
        cpuPayload.memory = { ramModules: ramRows };
      }
    }

    // Handle storage
    if (req.body.storage) {
      cpuPayload.storage = req.body.storage;
      // Ensure raidConfigured is set if passed in body.storage, else use root one if available
      if (req.body.raidConfigured !== undefined) {
         cpuPayload.storage.raidConfigured = toBool(req.body.raidConfigured);
      }
      if (Array.isArray(cpuPayload.storage?.storageDevices)) {
        cpuPayload.storage.totalNoOfStorage =
          cpuPayload.storage.totalNoOfStorage ??
          (cpuPayload.storage.storageDevices.filter(
            (d) => Number(d?.capacityGB) > 0 || (d?.modelNumber && String(d.modelNumber).trim())
          ).length ||
          null);
      }
    } else {
      const driveRows = collectIndexed(req.body, {
        driveManufacturer: { name: "manufacturer" },
        driveModelNumber: { name: "modelNumber" },
        driveCapacityGB: { name: "capacityGB", transform: toNum },
        driveType: { name: "type" },
        driveFormFactor: { name: "formFactor" },
        driveInterface: { name: "interface" },
        driveInterfaceSpeed: { name: "interfaceSpeed" },
        driveSerial: { name: "serialNumber" },
        driveSlot: { name: "slot" },
      });
      if (driveRows.length) {
        cpuPayload.storage = { 
          storageDevices: driveRows,
          raidConfigured: toBool(req.body.raidConfigured) 
        };
      }
    }

    if (Array.isArray(req.body.sections)) {
      cpuPayload.sections = req.body.sections; // Preserve UI sections
      const findSection = (name, kind) =>
        req.body.sections.find(
          (s) => String(s?.name).toLowerCase() === String(name).toLowerCase() && (!kind || s?.kind === kind)
        );
        
      const mem = findSection("Memory", "rows");
      if (!cpuPayload.memory && mem?.rows?.length) {
        cpuPayload.memory = {
          ramModules: mem.rows,
          totalNoOfMemory: mem.rows.filter(
            (m) => Number(m?.capacityGB) > 0 || (m?.modelNumber && String(m.modelNumber).trim())
          ).length,
        };
      }
      
      const sto = findSection("Storage", "rows");
      if (!cpuPayload.storage && sto?.rows?.length) {
        cpuPayload.storage = {
          storageDevices: sto.rows,
          totalNoOfStorage: sto.rows.filter(
            (d) => Number(d?.capacityGB) > 0 || (d?.modelNumber && String(d.modelNumber).trim())
          ).length,
          raidConfigured: toBool(req.body.raidConfigured),
        };
      }
      
      const basic = findSection("Basic Information", "group");
      if (basic?.data) {
        cpuPayload.basicInfo.manufacturer = v(basic.data.manufacturer) || cpuPayload.basicInfo.manufacturer;
        cpuPayload.basicInfo.model = v(basic.data.model) || cpuPayload.basicInfo.model;
        cpuPayload.basicInfo.assetName = v(basic.data.assetName) || cpuPayload.basicInfo.assetName;
      }
      
      const finance = findSection("Asset Financial Details", "group");
      if (finance?.data) {
        cpuPayload.basicInfo.assetTag = v(finance.data.assetTag) || cpuPayload.basicInfo.assetTag;
        cpuPayload.basicInfo.serialNumber = v(finance.data.serialNumber) || cpuPayload.basicInfo.serialNumber;
      }
      
      const proc = findSection("Processor", "group");
      if (proc?.data) {
        cpuPayload.processor = cpuPayload.processor || {};
        cpuPayload.processor.cpuModel = v(proc.data.cpuModel) || cpuPayload.processor.cpuModel;
        cpuPayload.processor.cpuManufacturer = v(proc.data.cpuManufacturer) || cpuPayload.processor.cpuManufacturer;
      }
      
      const os = findSection("Operating System", "group");
      if (os?.data) {
        cpuPayload.operatingSystem = cpuPayload.operatingSystem || {};
        cpuPayload.operatingSystem.osName = v(os.data.osName) || cpuPayload.operatingSystem.osName;
      }
      
      // Map other sections if they exist in UI
      const conn = findSection("Connectivity", "group");
      if (conn?.data) {
         cpuPayload.connectivity.ipAddress = cpuPayload.connectivity.ipAddress || v(conn.data.ipAddress);
         cpuPayload.connectivity.macAddress = cpuPayload.connectivity.macAddress || v(conn.data.macAddress);
         cpuPayload.connectivity.hostname = cpuPayload.connectivity.hostname || v(conn.data.hostname);
      }
      
      const loc = findSection("Location", "group");
      if (loc?.data) {
         cpuPayload.location.building = cpuPayload.location.building || v(loc.data.building);
         cpuPayload.location.floor = cpuPayload.location.floor || v(loc.data.floor);
         cpuPayload.location.room = cpuPayload.location.room || v(loc.data.room);
      }
    }

    const doc = await CPU.create(cpuPayload);
    return res.status(201).json(new apiResponse(201, doc, "CPU asset created successfully"));
  }

  throw new apiError(400, "Unsupported itemType. Only 'cpu' is currently supported.");
});

export const listAssets = asyncHandler(async (req, res) => {
  const { itemType, isActive, branchId } = req.query;
  const type = String(itemType || "").trim().toLowerCase();
  if (type !== "cpu") {
    throw new apiError(400, "Unsupported itemType. Only 'cpu' listing is available.");
  }
  const filter = { isDeleted: false };
  if (isActive !== undefined) filter.isActive = String(isActive) === "true";
  if (branchId) filter.branchId = branchId;
  if (req.user?.organizationId) filter.organizationId = req.user.organizationId;
  const items = await CPU.find(filter).sort({ createdAt: -1 }).lean();
  const flattenedItems = items.map((item) => ({
    ...item,
    assetName: item.basicInfo?.assetName || item.assetName,
    manufacturer: item.basicInfo?.manufacturer || item.manufacturer,
    model: item.basicInfo?.model || item.model,
    serialNumber: item.basicInfo?.serialNumber || item.serialNumber,
    assetTag: item.basicInfo?.assetTag || item.assetTag,
  }));
  return res.status(200).json(new apiResponse(200, { items: flattenedItems }, "CPU assets retrieved"));
});

export const getAssetById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { itemType } = req.query;
  const type = String(itemType || "").trim().toLowerCase();
  if (type !== "cpu") {
    throw new apiError(400, "Unsupported itemType. Only 'cpu' details are available.");
  }
  const doc = await CPU.findById(id).lean();
  if (!doc || doc.isDeleted) {
    throw new apiError(404, "Asset not found");
  }
  if (req.user?.organizationId && String(doc.organizationId) !== String(req.user.organizationId)) {
    throw new apiError(403, "Access denied for this asset");
  }
  const flattenedDoc = {
    ...doc,
    assetName: doc.basicInfo?.assetName || doc.assetName,
    manufacturer: doc.basicInfo?.manufacturer || doc.manufacturer,
    model: doc.basicInfo?.model || doc.model,
    serialNumber: doc.basicInfo?.serialNumber || doc.serialNumber,
    assetTag: doc.basicInfo?.assetTag || doc.assetTag,
  };
  return res.status(200).json(new apiResponse(200, flattenedDoc, "CPU asset retrieved"));
});
