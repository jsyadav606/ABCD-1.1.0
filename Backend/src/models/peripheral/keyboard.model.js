/**
 * Model: Keyboard Peripheral
 * Description: Keyboard-specific fields for peripheral assets. 
 * Collections: asset_peripheral_keyboard
 */
import mongoose from "mongoose";

const keyboardSchema = new mongoose.Schema(
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

    // Keyboard Specifications
    keyboardLayout: { type: String, trim: true, default: null }, // e.g., "QWERTY", "DVORAK", "AZERTY"
    keyType: { type: String, trim: true, default: null }, // e.g., "Mechanical", "Membrane", "Scissor"
    backlighting: { type: String, trim: true, default: null }, // "Yes" / "No"
    programmableKeys: { type: Number, default: null }, // Number of programmable keys
    keyCount: { type: Number, default: null }, // Total number of keys
    connectionType: { type: String, trim: true, default: null }, // "USB", "Wireless", "Bluetooth"
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

keyboardSchema.pre("save", function (next) {
  if (this.summary) {
    this.summary.assetName = [this.manufacturer, this.model].filter(Boolean).join(" ");
    this.summary.assetTag = this.assetTag || null;
    this.summary.serialNumber = this.serialNumber || null;
    this.summary.manufacturer = this.manufacturer || null;
    this.summary.model = this.model || null;
  }
  next();
});

keyboardSchema.index({ organizationId: 1, branchId: 1 });
keyboardSchema.index({ assetType: 1, assetIsCurrently: 1 });

export const Keyboard = mongoose.model("Keyboard", keyboardSchema);

