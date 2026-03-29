/**
 * Model: Laptop Asset
 * Description: Laptop-specific fields + summary for fast list views. Collection: asset_fixed
 */
import mongoose from "mongoose";

const laptopSchema = new mongoose.Schema(
  {
    itemCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
      required: true
    },
    itemType: { type: String, required: true, trim: true },
    itemTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemType",
      default: null
    },

    // Basic Information
    itemId: { type: String, trim: true, default: null },
    itemTag: { type: String, trim: true, default: null },
    barcode: { type: String, trim: true, default: null },
    itemSubType: { type: String, trim: true, default: null },
    manufacturer: { type: String, trim: true, default: null },
    model: { type: String, trim: true, default: null },
    modelNumber: { type: String, trim: true, default: null },
    serialNumber: { type: String, trim: true, default: null },
    partNumber: { type: String, trim: true, default: null },
    ownershipType: { type: String, trim: true, default: null },
    manufacturingDate: { type: Date, default: null },

    // CPU / Processor details
    processorManufacturer: { type: String, trim: true, default: null },
    processorModel: { type: String, trim: true, default: null },
    processorGeneration: { type: Number, default: null },
    processorModelNumber: { type: String, trim: true, default: null },
    cores: { type: Number, default: null },
    threads: { type: Number, default: null },
    virtualizationEnabled: { type: String, trim: true, default: null },

    // Operating System
    osName: { type: String, trim: true, default: null },
    osEdition: { type: String, trim: true, default: null },
    osVersion: { type: String, trim: true, default: null },
    buildNumber: { type: String, trim: true, default: null },
    osLicenseKey: { type: String, trim: true, default: null },
    activationStatus: { type: String, trim: true, default: null },
    domain: { type: String, trim: true, default: null },

    // Memory (table rows)
    memory: {
      modules: [
        {
          ramManufacturer: { type: String, trim: true, default: null },
          ramModelNumber: { type: String, trim: true, default: null },
          ramSerialNumber: { type: String, trim: true, default: null },
          ramCapacityGB: { type: Number, default: null },
          ramType: { type: String, trim: true, default: null },
          ramSpeedMHz: { type: Number, default: null },
          ramFormFactor: { type: String, trim: true, default: null },
          ramSlot: { type: String, trim: true, default: null },
          ramChannel: { type: String, trim: true, default: null },
        },
      ],
      totalQty: { type: Number, default: 0 },
      totalCapacityGB: { type: Number, default: 0 },
    },

    // Storage (table rows)
    storage: {
      devices: [
        {
          driveManufacturer: { type: String, trim: true, default: null },
          driveModelNumber: { type: String, trim: true, default: null },
          driveSerial: { type: String, trim: true, default: null },
          driveCapacityGB: { type: Number, default: null },
          driveType: { type: String, trim: true, default: null },
          driveInterfaceSpeed: { type: String, trim: true, default: null },
          raidConfigured: { type: String, trim: true, default: null },
          encryptionEnabled: { type: String, trim: true, default: null },
        },
      ],
      totalQty: { type: Number, default: 0 },
      totalCapacityGB: { type: Number, default: 0 },
      typeBreakdown: [
        {
          type: { type: String, trim: true, default: null },
          qty: { type: Number, default: 0 },
          capacityGB: { type: Number, default: 0 },
        },
      ],
    },

    // Display & graphics
    screenSizeInches: { type: Number, default: null },
    resolution: { type: String, trim: true, default: null },
    panelType: { type: String, trim: true, default: null },
    graphicsType: { type: String, trim: true, default: null },
    graphicsModel: { type: String, trim: true, default: null },

    // Battery & power
    originalCapacitymAh: { type: Number, default: null },
    chargerCapacityWatt: { type: Number, default: null },
    chargerSerial: { type: String, trim: true, default: null },
    chargerPinType: { type: String, trim: true, default: null },
    fastChargingSupported: { type: String, trim: true, default: null },

    // Security & hardware
    tpmVersion: { type: String, trim: true, default: null },
    secureBootEnabled: { type: String, trim: true, default: null },
    fingerprintScanner: { type: String, trim: true, default: null },
    faceRecognition: { type: String, trim: true, default: null },
    hardwareUUID: { type: String, trim: true, default: null },

    // Life-cycle status / item state
    lifecycleStatus: { type: String, trim: true, default: null },
    operationalStatus: { type: String, trim: true, default: null },
    lastAuditDate: { type: Date, default: null },
    condition: { type: String, trim: true, default: null },
    remarks: { type: String, trim: true, maxlength: 500, default: null },

    // Item state fields (common)
    itemStatus: { type: String, trim: true, default: "active" },
    itemIsCurrently: { type: String, trim: true, default: "inStore" },
    itemUser: { type: String, trim: true, default: null },
    AssignDate: { type: Date, default: null },

    // auditing
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },

    isActive: { type: Boolean, default: true },
    inactiveAt: { type: Date, default: null },
    inactiveBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    inactiveReason: { type: String, trim: true, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deletedReason: { type: String, trim: true, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    summary: {
      itemName: { type: String, trim: true, default: null },
      itemTag: { type: String, trim: true, default: null },
      serialNumber: { type: String, trim: true, default: null },
      manufacturer: { type: String, trim: true, default: null },
      model: { type: String, trim: true, default: null },
    },
  },
  { timestamps: true, collection: "asset_fixed" }
);

laptopSchema.index({ organizationId: 1, branchId: 1, itemCategory: 1, itemType: 1, isDeleted: 1, createdAt: -1 });
laptopSchema.index({ itemId: 1 }, { sparse: true });
laptopSchema.index({ serialNumber: 1 }, { sparse: true });

laptopSchema.pre("save", function () {
  this.summary = {
    itemName: this.itemId || "Laptop",
    itemTag: this.itemTag || this.itemId || "N/A",
    serialNumber: this.serialNumber || "N/A",
    manufacturer: this.manufacturer || "N/A",
    model: this.model || "N/A",
  };
});

const Laptop = mongoose.model("Laptop", laptopSchema);
export { Laptop };
