/**
 * Model: Monitor Asset
 * Description: Monitor specific fields + summary for fast list views. Collection: asset_monitor
 */
import mongoose from "mongoose";

const monitorSchema = new mongoose.Schema(
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

    itemId: { type: String, trim: true, default: null },
    itemTag: { type: String, trim: true, default: null },
    barcode: { type: String, trim: true, default: null },
    itemName: { type: String, trim: true, default: null },
    itemDescription: { type: String, trim: true, default: null },
    itemSubType: { type: String, trim: true, default: null },

    manufacturer: { type: String, trim: true, default: null },
    brand: { type: String, trim: true, default: null },
    model: { type: String, trim: true, default: null },
    modelNumber: { type: String, trim: true, default: null },
    partNumber: { type: String, trim: true, default: null },
    serialNumber: { type: String, trim: true, default: null },

    itemCondition: { type: String, trim: true, default: null },
    ownershipType: { type: String, trim: true, default: null },
    manufacturingDate: { type: Date, default: null },

    screenSizeInches: { type: Number, default: null },
    resolution: { type: String, trim: true, default: null },
    panelType: { type: String, trim: true, default: null },
    refreshRateHz: { type: Number, default: null },
    aspectRatio: { type: String, trim: true, default: null },
    brightnessNits: { type: Number, default: null },
    responseTimeMs: { type: Number, default: null },
    curved: { type: String, trim: true, default: null },

    hdmiPorts: { type: Number, default: null },
    displayPort: { type: Number, default: null },
    vgaPort: { type: String, trim: true, default: null },
    usbPorts: { type: Number, default: null },
    audioOut: { type: String, trim: true, default: null },
    builtInSpeakers: { type: String, trim: true, default: null },

    powerConsumptionWatt: { type: Number, default: null },
    energyRating: { type: String, trim: true, default: null },
    voltageRange: { type: String, trim: true, default: null },

    itemStatus: { type: String, trim: true, default: "active" },
    itemIsCurrently: { type: String, trim: true, default: "inStore" },
    itemUser: { type: String, trim: true, default: null },
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
      itemName: { type: String, trim: true, default: null },
      itemTag: { type: String, trim: true, default: null },
      serialNumber: { type: String, trim: true, default: null },
      manufacturer: { type: String, trim: true, default: null },
      model: { type: String, trim: true, default: null },
    },
  },
  { timestamps: true, collection: "asset_fixed" }
);

monitorSchema.index({ organizationId: 1, branchId: 1, itemCategory: 1, itemType: 1, isDeleted: 1, createdAt: -1 });
monitorSchema.index({ itemId: 1 }, { sparse: true });
monitorSchema.index({ serialNumber: 1 }, { sparse: true });

monitorSchema.pre("save", function () {
  this.summary = {
    itemName: this.itemId || "Monitor",
    itemTag: this.itemTag || this.itemId || "N/A",
    serialNumber: this.serialNumber || "N/A",
    manufacturer: this.manufacturer || "N/A",
    model: this.model || "N/A",
  };
});

const Monitor = mongoose.model("Monitor", monitorSchema);
export { Monitor };

