/**
 * Model: Printer Asset
 * Description: Printer specific fields + summary for fast list views. Collection: asset_fixed
 */
import mongoose from "mongoose";

const printerSchema = new mongoose.Schema(
  {
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

    // Basic Information
    AssetId: { type: String, trim: true, default: null },
    AssetTag: { type: String, trim: true, default: null },
    barcode: { type: String, trim: true, default: null },
    assetName: { type: String, trim: true, default: null },
    assetDescription: { type: String, trim: true, default: null },
    assetSubType: { type: String, trim: true, default: null },

    manufacturer: { type: String, trim: true, default: null },
    brand: { type: String, trim: true, default: null },
    model: { type: String, trim: true, default: null },
    modelNumber: { type: String, trim: true, default: null },
    partNumber: { type: String, trim: true, default: null },
    serialNumber: { type: String, trim: true, default: null },

    assetCondition: { type: String, trim: true, default: null },
    ownershipType: { type: String, trim: true, default: null },
    manufacturingDate: { type: Date, default: null },

    // Print Specifications
    printTechnology: { type: String, trim: true, default: null }, // Laser, Inkjet, Thermal
    colorSupport: { type: String, trim: true, default: null }, // Yes, No
    printSpeedPPM: { type: Number, default: null }, // Pages per minute
    maxResolutionDPI: { type: Number, default: null }, // DPI
    monthlyDutyCycle: { type: Number, default: null }, // Pages per month
    duplexPrinting: { type: String, trim: true, default: null }, // Yes, No
    networkSupport: { type: String, trim: true, default: null }, // Yes, No
    wirelessSupport: { type: String, trim: true, default: null }, // Yes, No
    scannerSupport: { type: String, trim: true, default: null }, // Yes, No (MFP)
    copierSupport: { type: String, trim: true, default: null }, // Yes, No (MFP)

    // Item Lifecycle Status
    lifecycleStatus: { type: String, trim: true, default: null }, // In Stock, Assigned, Under Repair, Retired
    operationalStatus: { type: String, trim: true, default: null }, // Good, Repair Needed, Damaged, Unknown
    totalPrintCount: { type: Number, default: null },
    lastServiceDate: { type: Date, default: null },
    condition: { type: String, trim: true, default: null }, // New, Good, Fair, Poor, Faulty

    // Scanner & Copier (If MFP)
    scannerAvailable: { type: String, trim: true, default: null }, // Yes, No
    scanResolutionDPI: { type: Number, default: null },
    copySpeedCPM: { type: Number, default: null }, // Copies per minute

    // Cartridge / Toner Details - Black Only (No Color Support)
    blackCartridgeModel: { type: String, trim: true, default: null },
    blackCartridgeYieldPages: { type: Number, default: null },
    blackCartridgePartNumber: { type: String, trim: true, default: null },
    blackCartridgeManufacturer: { type: String, trim: true, default: null },
    blackCartridgeLastChanged: { type: Date, default: null },
    blackCartridgeEstimatedEnd: { type: Date, default: null },
    blackCartridgeNotes: { type: String, trim: true, default: null },

    // Cartridge / Toner Details - Multi-Color (With Color Support)
    cartridges: [
      {
        cartridgeColor: { type: String, trim: true, default: null },
        cartridgeModel: { type: String, trim: true, default: null },
        cartridgePartNumber: { type: String, trim: true, default: null },
        cartridgeManufacturer: { type: String, trim: true, default: null },
        cartridgeYieldPages: { type: Number, default: null },
        cartridgeLastChanged: { type: Date, default: null },
        cartridgeEstimatedEnd: { type: Date, default: null },
      },
    ],

    // Network Details
    ipAddress: { type: String, trim: true, default: null },
    macAddress: { type: String, trim: true, default: null },
    gateway: { type: String, trim: true, default: null },
    subnet: { type: String, trim: true, default: null },
    dns: { type: String, trim: true, default: null },

    // Physical & Power
    printerColor: { type: String, trim: true, default: null },
    powerConsumptionWatt: { type: Number, default: null },
    voltageRange: { type: String, trim: true, default: null },

    // Status
    AssetStatus: { type: String, trim: true, default: "active" },
    assetIsCurrently: { type: String, trim: true, default: "inStore" },
    AssetUser: { type: String, trim: true, default: null },
    AssignDate: { type: Date, default: null },

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
      assetName: { type: String, trim: true, default: null },
      AssetTag: { type: String, trim: true, default: null },
      serialNumber: { type: String, trim: true, default: null },
      manufacturer: { type: String, trim: true, default: null },
      model: { type: String, trim: true, default: null },
    },
  },
  { timestamps: true, collection: "asset_fixed" }
);

printerSchema.index({ organizationId: 1, branchId: 1, AssetCategory: 1, assetType: 1, isDeleted: 1, createdAt: -1 });
printerSchema.index({ AssetId: 1 }, { sparse: true });
printerSchema.index({ serialNumber: 1 }, { sparse: true });

printerSchema.pre("save", function () {
  this.summary = {
    assetName: this.AssetId || "Printer",
    AssetTag: this.AssetTag || this.AssetId || "N/A",
    serialNumber: this.serialNumber || "N/A",
    manufacturer: this.manufacturer || "N/A",
    model: this.model || "N/A",
  };
});

export const Printer = mongoose.model("Printer", printerSchema);

