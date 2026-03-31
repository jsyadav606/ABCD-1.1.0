/**
 * Model: CPU Asset
 * Description: CPU specific fields + summary for fast list views. Collections: asset_cpu
 */
import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    // Mandatory first fields
    assetCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
      required: true
    },
    assetType: { type: String, required: true, trim: true },
    assetTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assetType",
      default: null
    },

    // Basic Information (matching frontend fields after omit)
    assetId: { type: String, trim: true, default: null },
    assetTag: { type: String, trim: true, default: null },
    barcode: { type: String, trim: true, default: null },
    assetSubType: { type: String, trim: true, default: null },
    manufacturer: { type: String, trim: true, default: null },
    model: { type: String, trim: true, default: null },
    modelNumber: { type: String, trim: true, default: null },
    partNumber: { type: String, trim: true, default: null },
    serialNumber: { type: String, trim: true, default: null },
    ownershipType: { type: String, trim: true, default: null },
    manufacturingDate: { type: Date, default: null }, 

    // Operating System
    osName: { type: String, trim: true, default: null },
    osEdition: { type: String, trim: true, default: null },
    osVersion: { type: String, trim: true, default: null },
    buildNumber: { type: String, trim: true, default: null },
    osLicenseKey: { type: String, trim: true, default: null },
    activationStatus: { type: String, trim: true, default: null },
    domain: { type: String, trim: true, default: null },

    // Memory (Table in frontend - Multiple RAM sticks)
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
      totalCapacityGB: { type: Number, default: 0 }
    },

    // Processor
    processorManufacturer: { type: String, trim: true, default: null },
    processorModel: { type: String, trim: true, default: null },
    processorGeneration: { type: Number, default: null },
    processorModelNumber: { type: String, trim: true, default: null },
    cores: { type: Number, default: null },
    threads: { type: Number, default: null },
    virtualizationEnabled: { type: String, trim: true, default: null },

    // Storage (Table in frontend - Multiple Drives)
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
          type: { type: String, trim: true },
          qty: { type: Number, default: 0 },
          capacityGB: { type: Number, default: 0 }
        }
      ]
    },

    // BIOS & Hardware
    biosVersion: { type: String, trim: true, default: null },
    biosDate: { type: Date, default: null },
    motherboardSerial: { type: String, trim: true, default: null },
    hardwareUUID: { type: String, trim: true, default: null },
    tpmVersion: { type: String, trim: true, default: null },
    secureBootEnabled: { type: String, trim: true, default: null },

    // Graphics Card
    gpuManufacturer: { type: String, trim: true, default: null },
    gpuModelNumber: { type: String, trim: true, default: null },
    gpuSerialNumber: { type: String, trim: true, default: null },
    gpuCapacityGB: { type: Number, default: null },
    gpuType: { type: String, trim: true, default: null },
    gpuInterfaceSpeed: { type: String, trim: true, default: null },

    // Item State
    assetStatus: { type: String, trim: true, default: "active" },
    assetIsCurrently: { type: String, trim: true, default: "inStore" },
    assetUser: { type: String, trim: true, default: null },
    assignDate: { type: Date, default: null },

    // Network (Table in frontend)
    network: {
      interfaces: [
        {
          hostname: { type: String, trim: true, default: null },
          nicType: { type: String, trim: true, default: null },
          ipv4Address: { type: String, trim: true, default: null },
          ipv6Address: { type: String, trim: true, default: null },
          macAddress: { type: String, trim: true, default: null },
          subnet: { type: String, trim: true, default: null },
          defaultGateway: { type: String, trim: true, default: null },
          dhcpEnabled: { type: String, trim: true, default: null },
          dhcpServer: { type: String, trim: true, default: null },
          dnsHostname: { type: String, trim: true, default: null },
          ethernetPort: { type: String, trim: true, default: null },
          switchPort: { type: String, trim: true, default: null },
          linkSpeedMbps: { type: Number, default: null },
          wifiSSID: { type: String, trim: true, default: null },
          wifiSecurity: { type: String, trim: true, default: null },
          wifiBand: { type: String, trim: true, default: null },
        },
      ],
      totalQty: { type: Number, default: 0 },
      typeBreakdown: [
        {
          nicType: { type: String, trim: true, default: null },
          qty: { type: Number, default: 0 }
        }
      ]
    },

    // Infrastructure fields
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

    // Summary field for quick listing (Industrial standard to avoid deep object lookup)
    summary: {
      assetName: { type: String, trim: true, default: null },
      assetTag: { type: String, trim: true, default: null },
      serialNumber: { type: String, trim: true, default: null },
      manufacturer: { type: String, trim: true, default: null },
      model: { type: String, trim: true, default: null },
    }
  },
  { timestamps: true, collection: "asset_fixed" }
);

// Indices for performance
assetSchema.index({ organizationId: 1, branchId: 1, AssetCategory: 1, assetType: 1, isDeleted: 1, createdAt: -1 });
assetSchema.index({ assetId: 1 }, { sparse: true });
assetSchema.index({ serialNumber: 1 }, { sparse: true });

// Pre-save hook to populate summary if needed
assetSchema.pre("save", function () {
  // Map identifying fields to summary for compatibility with list views
  this.summary = {
    assetName: this.assetId || "CPU",
    assetTag: this.assetTag || this.assetId || "N/A",
    barcode: this.barcode || "N/A",
    serialNumber: this.serialNumber || "N/A",
    manufacturer: this.manufacturer || "N/A",
    model: this.model || "N/A",
  };
});

const CPU = mongoose.model("CPU", assetSchema);
export { CPU };

