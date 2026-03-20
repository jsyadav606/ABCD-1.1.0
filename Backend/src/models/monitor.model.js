/**
 * Model: Monitor Asset
 * Description: Monitor specific fields + summary for fast list views. Collection: asset_monitor
 */
import mongoose from "mongoose";

const monitorSchema = new mongoose.Schema(
  {
    itemCategory: { type: String, required: true, trim: true },
    itemType: { type: String, required: true, trim: true },

    itemId: { type: String, trim: true },
    itemTag: { type: String, trim: true },
    barcode: { type: String, trim: true },
    itemName: { type: String, trim: true },
    itemDescription: { type: String, trim: true },
    itemSubType: { type: String, trim: true },

    manufacturer: { type: String, trim: true },
    brand: { type: String, trim: true },
    model: { type: String, trim: true },
    modelNumber: { type: String, trim: true },
    partNumber: { type: String, trim: true },
    serialNumber: { type: String, trim: true },

    itemCondition: { type: String, trim: true },
    ownershipType: { type: String, trim: true },
    manufacturingDate: { type: Date, default: null },

    screenSizeInches: { type: Number, default: null },
    resolution: { type: String, trim: true },
    panelType: { type: String, trim: true },
    refreshRateHz: { type: Number, default: null },
    aspectRatio: { type: String, trim: true },
    brightnessNits: { type: Number, default: null },
    responseTimeMs: { type: Number, default: null },
    curved: { type: String, trim: true },

    hdmiPorts: { type: Number, default: null },
    displayPort: { type: Number, default: null },
    vgaPort: { type: String, trim: true },
    usbPorts: { type: Number, default: null },
    audioOut: { type: String, trim: true },
    builtInSpeakers: { type: String, trim: true },

    powerConsumptionWatt: { type: Number, default: null },
    energyRating: { type: String, trim: true },
    voltageRange: { type: String, trim: true },

    itemStatus: { type: String, trim: true, default: "active" },
    itemIsCurrently: { type: String, trim: true, default: "inStore" },
    itemUser: { type: String, trim: true },
    AssignDate: { type: Date, default: null },

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

