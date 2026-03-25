/**
 * Model: CPU Asset
 * Description: CPU specific fields + summary for fast list views. Collections: asset_cpu
 */
import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    // Mandatory first fields
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

    // Basic Information (matching frontend fields after omit)
    itemId: { type: String, trim: true },
    itemTag: { type: String, trim: true },
    barcode: { type: String, trim: true },
    itemSubType: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    model: { type: String, trim: true },
    modelNumber: { type: String, trim: true },
    partNumber: { type: String, trim: true },
    serialNumber: { type: String, trim: true },
    ownershipType: { type: String, trim: true },
    manufacturingDate: { type: Date, default: null }, 

    // Operating System
    osName: { type: String, trim: true },
    osEdition: { type: String, trim: true },
    osVersion: { type: String, trim: true },
    buildNumber: { type: String, trim: true },
    osLicenseKey: { type: String, trim: true },
    activationStatus: { type: String, trim: true },
    domain: { type: String, trim: true },

    // Memory (Table in frontend - Multiple RAM sticks)
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
      totalCapacityGB: { type: Number, default: 0 }
    },

    // Processor
    processorManufacturer: { type: String, trim: true },
    processorModel: { type: String, trim: true },
    processorGeneration: { type: Number, default: null },
    processorModelNumber: { type: String, trim: true },
    cores: { type: Number, default: null },
    threads: { type: Number, default: null },
    virtualizationEnabled: { type: String, trim: true },

    // Storage (Table in frontend - Multiple Drives)
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
          capacityGB: { type: Number, default: 0 }
        }
      ]
    },

    // BIOS & Hardware
    biosVersion: { type: String, trim: true },
    biosDate: { type: Date, default: null },
    motherboardSerial: { type: String, trim: true },
    hardwareUUID: { type: String, trim: true },
    tpmVersion: { type: String, trim: true },
    secureBootEnabled: { type: String, trim: true },

    // Graphics Card
    gpuManufacturer: { type: String, trim: true },
    gpuModelNumber: { type: String, trim: true },
    gpuSerialNumber: { type: String, trim: true },
    gpuCapacityGB: { type: Number, default: null },
    gpuType: { type: String, trim: true },
    gpuInterfaceSpeed: { type: String, trim: true },

    // Item State
    itemStatus: { type: String, trim: true, default: "active" },
    itemIsCurrently: { type: String, trim: true, default: "inStore" },
    itemUser: { type: String, trim: true },
    AssignDate: { type: Date, default: null },

    // Network (Table in frontend)
    network: {
      interfaces: [
        {
          hostname: { type: String, trim: true },
          nicType: { type: String, trim: true },
          ipv4Address: { type: String, trim: true },
          ipv6Address: { type: String, trim: true },
          macAddress: { type: String, trim: true },
          subnet: { type: String, trim: true },
          defaultGateway: { type: String, trim: true },
          dhcpEnabled: { type: String, trim: true },
          dhcpServer: { type: String, trim: true },
          dnsHostname: { type: String, trim: true },
          ethernetPort: { type: String, trim: true },
          switchPort: { type: String, trim: true },
          linkSpeedMbps: { type: Number, default: null },
          wifiSSID: { type: String, trim: true },
          wifiSecurity: { type: String, trim: true },
          wifiBand: { type: String, trim: true },
        },
      ],
      totalQty: { type: Number, default: 0 },
      typeBreakdown: [
        {
          nicType: { type: String, trim: true },
          qty: { type: Number, default: 0 }
        }
      ]
    },

    // Infrastructure fields
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Summary field for quick listing (Industrial standard to avoid deep object lookup)
    summary: {
      itemName: { type: String, trim: true },
      itemTag: { type: String, trim: true },
      serialNumber: { type: String, trim: true },
      manufacturer: { type: String, trim: true },
      model: { type: String, trim: true },
    }
  },
  { timestamps: true, collection: "asset_fixed" }
);

// Indices for performance
assetSchema.index({ organizationId: 1, branchId: 1, itemCategory: 1, itemType: 1, isDeleted: 1, createdAt: -1 });
assetSchema.index({ itemId: 1 }, { sparse: true });
assetSchema.index({ serialNumber: 1 }, { sparse: true });

// Pre-save hook to populate summary if needed
assetSchema.pre("save", function () {
  // Map identifying fields to summary for compatibility with list views
  this.summary = {
    itemName: this.itemId || "CPU",
    itemTag: this.itemTag || this.itemId || "N/A",
    barcode: this.barcode || "N/A",
    serialNumber: this.serialNumber || "N/A",
    manufacturer: this.manufacturer || "N/A",
    model: this.model || "N/A",
  };
});

const CPU = mongoose.model("CPU", assetSchema);
export { CPU };
