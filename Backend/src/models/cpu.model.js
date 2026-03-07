import mongoose from "mongoose";

const cpuSchema = new mongoose.Schema(
  {
    itemType: { type: String, required: true, trim: true, default: "cpu" },
    
    // 1. Basic Information / Identity
    basicInfo: {
      assetTag: { type: String, required: true, trim: true, index: true },
      serialNumber: { type: String, required: true, trim: true, index: true },
      assetName: { type: String, required: true, trim: true },
      assetCategory: { type: String, default: null, trim: true },
      manufacturer: { type: String, required: true, trim: true },
      model: { type: String, required: true, trim: true },
      deviceType: { type: String, default: null, trim: true },
      description: { type: String, default: null, trim: true },
    },

    // 2. Hardware Specifications
    processor: {
      cpuModel: { type: String, default: null, trim: true },
      cpuManufacturer: { type: String, default: null, trim: true },
      clockSpeedGHz: { type: Number, default: null, min: 0 },
      cores: { type: Number, default: null, min: 0 },
      threads: { type: Number, default: null, min: 0 },
      virtualizationEnabled: { type: Boolean, default: false },
      cpuSocket: { type: String, default: null, trim: true },
      memoryTypeSupported: { type: String, default: null, trim: true },
      maxMemoryCapacityGB: { type: Number, default: null, min: 0 },
      maxMemorySpeedMHz: { type: Number, default: null, min: 0 },
      pcieGenSupported: { type: String, default: null, trim: true },
    },

    memory: {
      totalRamGB: { type: Number, default: null, min: 0 },
      totalNoOfMemory: { type: Number, default: null, min: 0 },
      ramModules: [
        {
          manufacturer: { type: String, default: null, trim: true },
          modelNumber: { type: String, default: null, trim: true },
          capacityGB: { type: Number, default: null, min: 0 },
          type: { type: String, default: null, trim: true },
          speedMHz: { type: Number, default: null, min: 0 },
          formFactor: { type: String, default: null, trim: true },
          slot: { type: String, default: null, trim: true },
          channel: { type: String, default: null, trim: true },
        },
      ],
    },
  
    storage: {
      totalNoOfStorage: { type: Number, default: null, min: 0 },
      totalStorageCapacityGB: { type: Number, default: null, min: 0 },
      raidConfigured: { type: Boolean, default: false },
      storageDevices: [
        {
          manufacturer: { type: String, default: null, trim: true },
          modelNumber: { type: String, default: null, trim: true },
          capacityGB: { type: Number, default: null, min: 0 },
          type: { type: String, default: null, trim: true },
          formFactor: { type: String, default: null, trim: true },
          interface: { type: String, default: null, trim: true },
          interfaceSpeed: { type: String, default: null, trim: true },
          serialNumber: { type: String, default: null, trim: true },
          slot: { type: String, default: null, trim: true },
        },
      ],
    },

    operatingSystem: {
      osName: { type: String, default: null, trim: true },
      osEdition: { type: String, default: null, trim: true },
      osVersion: { type: String, default: null, trim: true },
      buildNumber: { type: String, default: null, trim: true },
      osLicenseKey: { type: String, default: null, trim: true },
      activationStatus: { type: String, default: null, trim: true },
    },

    // 3. Connectivity / Network
    connectivity: {
      hostname: { type: String, default: null, trim: true },
      domain: { type: String, default: null, trim: true },
      ipAddress: { type: String, default: null, trim: true },
      macAddress: { type: String, default: null, trim: true },
      nicType: { type: String, default: null, trim: true },
      vlan: { type: String, default: null, trim: true },
      dhcpEnabled: { type: Boolean, default: false },
      dnsHostname: { type: String, default: null, trim: true },
    },

    // 4. Security & BIOS
    security: {
      biosVersion: { type: String, default: null, trim: true },
      biosDate: { type: Date, default: null },
      motherboardSerial: { type: String, default: null, trim: true },
      hardwareUUID: { type: String, default: null, trim: true },
      tpmVersion: { type: String, default: null, trim: true },
      secureBootEnabled: { type: Boolean, default: false },
      encryptionEnabled: { type: Boolean, default: false },
    },

    // 5. Lifecycle & Financials
    lifecycle: {
      status: { type: String, default: null, trim: true }, // e.g. In Use, Retired
      operationalStatus: { type: String, default: null, trim: true }, // e.g. Good, Repair Needed
      acquisitionDate: { type: Date, default: null },
      warrantyExpiryDate: { type: Date, default: null },
      purchaseCost: { type: Number, default: null, min: 0 },
      vendor: { type: String, default: null, trim: true },
      depreciationMethod: { type: String, default: null, trim: true },
      usefulLifeYears: { type: Number, default: null, min: 0 },
      residualValue: { type: Number, default: null, min: 0 },
      lastAuditDate: { type: Date, default: null },
    },

    // 6. Location & Assignment
    location: {
      branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
      building: { type: String, default: null, trim: true },
      floor: { type: String, default: null, trim: true },
      room: { type: String, default: null, trim: true },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      assignmentDate: { type: Date, default: null },
    },

    compatibility: {
      memoryTypeOk: { type: Boolean, default: null },
      pcieOk: { type: Boolean, default: null },
      notes: { type: String, default: null, trim: true },
    },

    // System / Metadata
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null }, // Top-level for indexing/tenancy

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "asset_cpu" }
);

cpuSchema.index({ "basicInfo.manufacturer": 1, "basicInfo.model": 1, isDeleted: 1 });
cpuSchema.index({ organizationId: 1, branchId: 1, isActive: 1 });
cpuSchema.index({ "basicInfo.serialNumber": 1 }, { sparse: true });
cpuSchema.index({ "basicInfo.assetTag": 1 }, { sparse: true });
cpuSchema.index({ createdAt: -1 });

cpuSchema.pre("validate", function () {
  const trimStr = (v) => (typeof v === "string" ? v.trim() : v);
  this.itemType = trimStr(this.itemType);
  
  if (this.basicInfo) {
    this.basicInfo.assetName = trimStr(this.basicInfo.assetName);
    this.basicInfo.assetCategory = trimStr(this.basicInfo.assetCategory);
    this.basicInfo.manufacturer = trimStr(this.basicInfo.manufacturer);
    this.basicInfo.model = trimStr(this.basicInfo.model);
    this.basicInfo.deviceType = trimStr(this.basicInfo.deviceType);
    this.basicInfo.assetTag = trimStr(this.basicInfo.assetTag);
    this.basicInfo.serialNumber = trimStr(this.basicInfo.serialNumber);
    this.basicInfo.description = trimStr(this.basicInfo.description);
  }

  if (this.operatingSystem) {
    this.operatingSystem.osName = trimStr(this.operatingSystem.osName);
    this.operatingSystem.osEdition = trimStr(this.operatingSystem.osEdition);
    this.operatingSystem.osVersion = trimStr(this.operatingSystem.osVersion);
    this.operatingSystem.buildNumber = trimStr(this.operatingSystem.buildNumber);
    this.operatingSystem.osLicenseKey = trimStr(this.operatingSystem.osLicenseKey);
    this.operatingSystem.activationStatus = trimStr(this.operatingSystem.activationStatus);
  }

  if (this.processor) {
    this.processor.cpuSocket = trimStr(this.processor.cpuSocket);
    this.processor.memoryTypeSupported = trimStr(this.processor.memoryTypeSupported);
    this.processor.pcieGenSupported = trimStr(this.processor.pcieGenSupported);
    this.processor.cpuModel = trimStr(this.processor.cpuModel);
    this.processor.cpuManufacturer = trimStr(this.processor.cpuManufacturer);
  }

  if (this.connectivity) {
    this.connectivity.hostname = trimStr(this.connectivity.hostname);
    this.connectivity.domain = trimStr(this.connectivity.domain);
    this.connectivity.ipAddress = trimStr(this.connectivity.ipAddress);
    this.connectivity.macAddress = trimStr(this.connectivity.macAddress);
    this.connectivity.nicType = trimStr(this.connectivity.nicType);
    this.connectivity.vlan = trimStr(this.connectivity.vlan);
    this.connectivity.dnsHostname = trimStr(this.connectivity.dnsHostname);
  }

  if (this.security) {
    this.security.biosVersion = trimStr(this.security.biosVersion);
    this.security.motherboardSerial = trimStr(this.security.motherboardSerial);
    this.security.hardwareUUID = trimStr(this.security.hardwareUUID);
    this.security.tpmVersion = trimStr(this.security.tpmVersion);
  }

  if (this.lifecycle) {
    this.lifecycle.status = trimStr(this.lifecycle.status);
    this.lifecycle.operationalStatus = trimStr(this.lifecycle.operationalStatus);
    this.lifecycle.vendor = trimStr(this.lifecycle.vendor);
  }

  if (this.location) {
    this.location.building = trimStr(this.location.building);
    this.location.floor = trimStr(this.location.floor);
    this.location.room = trimStr(this.location.room);
  }

  if (this.memory?.ramModules?.length) {
    this.memory.ramModules = this.memory.ramModules.map((m) => ({
      ...m,
      manufacturer: trimStr(m?.manufacturer),
      modelNumber: trimStr(m?.modelNumber),
      type: trimStr(m?.type),
      formFactor: trimStr(m?.formFactor),
      slot: trimStr(m?.slot),
      channel: trimStr(m?.channel),
    }));
  }

  if (this.storage?.storageDevices?.length) {
    this.storage.storageDevices = this.storage.storageDevices.map((d) => ({
      ...d,
      manufacturer: trimStr(d?.manufacturer),
      modelNumber: trimStr(d?.modelNumber),
      type: trimStr(d?.type),
      formFactor: trimStr(d?.formFactor),
      interface: trimStr(d?.interface),
      interfaceSpeed: trimStr(d?.interfaceSpeed),
      serialNumber: trimStr(d?.serialNumber),
      slot: trimStr(d?.slot),
    }));
  }
});

cpuSchema.pre("save", function () {
  if (Array.isArray(this.memory?.ramModules)) {
    const total = this.memory.ramModules.reduce((sum, m) => sum + (Number(m?.capacityGB) || 0), 0);
    const count = this.memory.ramModules.filter((m) => Number(m?.capacityGB) > 0 || (m?.modelNumber && m.modelNumber.trim())).length;
    if (isFinite(total)) this.memory.totalRamGB = total;
    this.memory.totalNoOfMemory = count || this.memory.totalNoOfMemory || null;
  }
  if (Array.isArray(this.storage?.storageDevices)) {
    const total = this.storage.storageDevices.reduce((sum, d) => sum + (Number(d?.capacityGB) || 0), 0);
    const count = this.storage.storageDevices.filter((d) => Number(d?.capacityGB) > 0 || (d?.modelNumber && d.modelNumber.trim())).length;
    if (isFinite(total)) this.storage.totalStorageCapacityGB = total;
    this.storage.totalNoOfStorage = count || this.storage.totalNoOfStorage || null;
  }
  const memType = this.processor?.memoryTypeSupported;
  const pcieGen = this.processor?.pcieGenSupported;
  if (memType || pcieGen) {
    const memOk =
      !memType ||
      (Array.isArray(this.memory?.ramModules) &&
        this.memory.ramModules.every((m) => !m?.type || String(m.type).toLowerCase() === String(memType).toLowerCase()));
    const pcieOk = true;
    this.compatibility = {
      memoryTypeOk: memOk,
      pcieOk,
      notes: this.compatibility?.notes || null,
    };
  }
});

const CPU = mongoose.model("CPU", cpuSchema);
export { CPU };
