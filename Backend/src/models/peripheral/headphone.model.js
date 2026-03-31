/**
 * Model: Headphone Peripheral
 * Description: Headphone-specific fields for peripheral assets. 
 * Collections: asset_peripheral_headphone
 */
import mongoose from "mongoose";

const headphoneSchema = new mongoose.Schema(
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

    // Basic Information
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

    // Location & Other Information
    location: { type: String, trim: true, default: null },
    locationType: { type: String, trim: true, default: null },
    building: { type: String, trim: true, default: null },
    floor: { type: String, trim: true, default: null },
    room: { type: String, trim: true, default: null },
    rackNumber: { type: String, trim: true, default: null },
    rackUnit: { type: Number, default: null },

    // Headphone Specifications
    type: { type: String, trim: true, default: null }, // "Over-Ear", "On-Ear", "In-Ear"
    frequencyResponse: { type: String, trim: true, default: null }, // e.g., "20Hz-20kHz"
    impedance: { type: Number, default: null }, // Ohms
    driverSize: { type: Number, default: null }, // mm
    connectionType: { type: String, trim: true, default: null }, // "USB", "3.5mm", "Wireless", "Bluetooth"
    wirelessRange: { type: Number, default: null }, // meters (for wireless)
    batteryLife: { type: String, trim: true, default: null }, // e.g., "30 hours"
    microphone: { type: String, trim: true, default: null }, // "Yes" / "No"
    noiseCancellation: { type: String, trim: true, default: null }, // "Active", "Passive", "None"
    color: { type: String, trim: true, default: null },
    weight: { type: Number, default: null }, // grams

    // Item State
    assetStatus: { type: String, trim: true, default: "active" },
    assetIsCurrently: { type: String, trim: true, default: "inStore" },
    assetUser: { type: String, trim: true, default: null },
    assignDate: { type: Date, default: null },

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

    // Summary field for quick listing
    summary: {
      assetName: { type: String, trim: true, default: null },
      assetTag: { type: String, trim: true, default: null },
      serialNumber: { type: String, trim: true, default: null },
      manufacturer: { type: String, trim: true, default: null },
      model: { type: String, trim: true, default: null },
    }
  },
  { timestamps: true, collection: "asset_peripheral" }
);

headphoneSchema.pre("save", function (next) {
  if (this.summary) {
    this.summary.assetName = [this.manufacturer, this.model].filter(Boolean).join(" ");
    this.summary.assetTag = this.assetTag || null;
    this.summary.serialNumber = this.serialNumber || null;
    this.summary.manufacturer = this.manufacturer || null;
    this.summary.model = this.model || null;
  }
  next();
});

headphoneSchema.index({ organizationId: 1, branchId: 1 });
headphoneSchema.index({ assetType: 1, assetIsCurrently: 1 });

export const Headphone = mongoose.model("Headphone", headphoneSchema);

