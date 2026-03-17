import mongoose from "mongoose";

const warrantySchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    itemCategory: { type: String, trim: true },
    itemType: { type: String, trim: true },

    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null, index: true },

    warrantyAvailable: { type: String, trim: true, default: "No" },
    warrantyMode: { type: String, trim: true },
    inYear: { type: Number, default: null },
    inMonth: { type: Number, default: null },
    warrantyStartDate: { type: Date, default: null },
    warrantyEndDate: { type: Date, default: null },
    warrantyProvider: { type: String, trim: true },
    supportVendor: { type: String, trim: true },
    supportPhone: { type: String, trim: true },
    supportEmail: { type: String, trim: true },

    // Calculated warranty till date and status
    warrantyTillDate: { type: Date, default: null },
    warrantyStatus: { type: String, enum: ["Under Warranty", "Expired"], default: null },

    amcAvailable: { type: String, trim: true },
    amcVendor: { type: String, trim: true },
    amcStartDate: { type: Date, default: null },
    amcEndDate: { type: Date, default: null },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "asset_warranties" }
);

warrantySchema.index(
  { organizationId: 1, assetId: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const Warranty = mongoose.model("Warranty", warrantySchema);

