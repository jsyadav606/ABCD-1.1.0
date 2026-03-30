import mongoose from "mongoose";

const warrantySchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    itemCategory: { type: String, trim: true, default: null },
    itemType: { type: String, trim: true, default: null },

    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null, index: true },

    warrantyAvailable: { type: String, trim: true, default: "No" }, // Yes or No
    warrantyMode: { type: String, trim: true, default: null }, // Applicable if warrantyAvailable is "Yes", e.g. Duration, End Date
    inYear: { type: Number, default: null }, // Applicable if warrantyMode is "Duration"
    inMonth: { type: Number, default: null }, // Applicable if warrantyMode is "Duration"
    warrantyStartDate: { type: Date, default: null }, // Applicable if warrantyMode is "End Date"
    warrantyEndDate: { type: Date, default: null }, // Applicable if warrantyMode is "End Date"
    warrantyProvider: { type: String, trim: true, default: null }, // Applicable if warrantyAvailable is "Yes", e.g. Manufacturer, Vendor, External
    supportVendor: { type: String, trim: true, default: null },
    supportPhone: { type: String, trim: true, default: null },
    supportEmail: { type: String, trim: true, default: null },

    // Calculated warranty till date and status
    warrantyTillDate: { type: Date, default: null }, // Calculated field based on invoice Date and warrantyMode, inYear, inMonth, warrantyStartDate, warrantyEndDate and current date. 
    warrantyStatus: { type: String, enum: ["Under Warranty", "Expired"], default: null }, // Calculated field based on warrantyTillDate and current date.

    amcAvailable: { type: String, trim: true, default: "No" }, // Applicable if warrantyAvailable is "No", e.g. Yes or No
    amcVendor: { type: String, trim: true, default: null },  // Applicable if amcAvailable is "Yes" 
    amcPhone: { type: String, trim: true, default: null },  // Applicable if amcAvailable is "Yes"
    amcEmail: { type: String, trim: true, default: null },  // Applicable if amcAvailable is "Yes"
    amcStartDate: { type: Date, default: null }, // Applicable if amcAvailable is "Yes"
    amcEndDate: { type: Date, default: null }, // Applicable if amcAvailable is "Yes"
    amcStatus: { type: String, enum: ["Active", "Expired"], default: null }, // Calculated field based on amcEndDate and current date.

    isActive: { type: Boolean, default: true },
    inactiveAt: { type: Date, default: null },
    inactiveBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    inactiveReason: { type: String, trim: true, default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deletedReason: { type: String, trim: true, default: null },
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

