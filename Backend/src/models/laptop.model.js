/**
 * Model: Laptop Asset
 * Description: Laptop-specific fields + summary for fast list views. Collection: asset_fixed
 */
import mongoose from "mongoose";

const laptopSchema = new mongoose.Schema(
  {
    itemCategory: { type: String, required: true, trim: true },
    itemType: { type: String, required: true, trim: true },

    // Basic Information
    itemId: { type: String, trim: true },
    itemTag: { type: String, trim: true },
    barcode: { type: String, trim: true },
    itemSubType: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    model: { type: String, trim: true },
    modelNumber: { type: String, trim: true },
    serialNumber: { type: String, trim: true },
    partNumber: { type: String, trim: true },
    ownershipType: { type: String, trim: true },
    manufacturingDate: { type: Date, default: null },

    // CPU / Processor details
    processorManufacturer: { type: String, trim: true },
    processorModel: { type: String, trim: true },
    processorGeneration: { type: Number, default: null },
    processorModelNumber: { type: String, trim: true },
    cores: { type: Number, default: null },
    threads: { type: Number, default: null },
    virtualizationEnabled: { type: String, trim: true },

    // Operating System
    osName: { type: String, trim: true },
    osEdition: { type: String, trim: true },
    osVersion: { type: String, trim: true },
    buildNumber: { type: String, trim: true },
    osLicenseKey: { type: String, trim: true },
    activationStatus: { type: String, trim: true },
    domain: { type: String, trim: true },

    // Memory (table rows)
    memory: {
      modules: [
        {
          ramManufacturer: { type: String, trim: true },
          ramModelNumber: { type: String, trim: true },
          ramSerialNumber: { type: String, trim: true },
          ramCapacityGB: { type: Number, default: null },
          ramType: { type: String, trim: true },
          ramSpeedMHz: { type: Number, default: null },
          ramFormFactor: { type: String, trim: true },
          ramSlot: { type: String, trim: true },
          ramChannel: { type: String, trim: true },
        },
      ],
      totalQty: { type: Number, default: 0 },
      totalCapacityGB: { type: Number, default: 0 },
    },

    // Storage (table rows)
    storage: {
      devices: [
        {
          driveManufacturer: { type: String, trim: true },
          driveModelNumber: { type: String, trim: true },
          driveSerial: { type: String, trim: true },
          driveCapacityGB: { type: Number, default: null },
          driveType: { type: String, trim: true },
          driveInterfaceSpeed: { type: String, trim: true },
          raidConfigured: { type: String, trim: true },
          encryptionEnabled: { type: String, trim: true },
        },
      ],
      totalQty: { type: Number, default: 0 },
      totalCapacityGB: { type: Number, default: 0 },
      typeBreakdown: [
        {
          type: { type: String, trim: true },
          qty: { type: Number, default: 0 },
          capacityGB: { type: Number, default: 0 },
        },
      ],
    },

    // Display & graphics
    screenSizeInches: { type: Number, default: null },
    resolution: { type: String, trim: true },
    panelType: { type: String, trim: true },
    graphicsType: { type: String, trim: true },
    graphicsModel: { type: String, trim: true },

    // Battery & power
    originalCapacitymAh: { type: Number, default: null },
    chargerCapacityWatt: { type: Number, default: null },
    chargerSerial: { type: String, trim: true },
    chargerPinType: { type: String, trim: true },
    fastChargingSupported: { type: String, trim: true },

    // Security & hardware
    tpmVersion: { type: String, trim: true },
    secureBootEnabled: { type: String, trim: true },
    fingerprintScanner: { type: String, trim: true },
    faceRecognition: { type: String, trim: true },
    hardwareUUID: { type: String, trim: true },

    // Life-cycle status / item state
    lifecycleStatus: { type: String, trim: true },
    operationalStatus: { type: String, trim: true },
    lastAuditDate: { type: Date, default: null },
    condition: { type: String, trim: true },
    remarks: { type: String, trim: true, maxlength: 500 },

    // Item state fields (common)
    itemStatus: { type: String, trim: true, default: "active" },
    itemIsCurrently: { type: String, trim: true, default: "inStore" },
    itemUser: { type: String, trim: true },
    AssignDate: { type: Date, default: null },

    // auditing
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    summary: {
      itemName: { type: String, trim: true },
      itemTag: { type: String, trim: true },
      serialNumber: { type: String, trim: true },
      manufacturer: { type: String, trim: true },
      model: { type: String, trim: true },
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
