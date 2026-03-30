import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    itemCategory: { type: String, trim: true, default: null },
    itemType: { type: String, trim: true, default: null },

    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null, index: true },

    purchaseType: { type: String, trim: true, default: null }, //e.g. PO, Direct.
    poNumber: { type: String, trim: true, default: null }, // Applicable if purchaseType is PO.
    poDate: { type: Date, default: null }, // Applicable if purchaseType is PO.
    receiptNumber: { type: String, trim: true, default: null },
    receiptDate: { type: Date, default: null },
    purchaseDate: { type: Date, default: null }, // Date of invoice or delivery Challan.
    vendorId: { type: String, trim: true, default: null }, // Could be a reference to a Vendor collection if needed.

    itemReceivedOn: { type: String, trim: true, default: null }, // e.g. invoice, challan.
    invoiceNumber: { type: String, trim: true, default: null }, // Applicable if itemReceivedOn is invoice.
    invoiceDate: { type: Date, default: null }, // Applicable if itemReceivedOn is invoice.
    deliveryChallanNumber: { type: String, trim: true, default: null }, // Applicable if itemReceivedOn is challan.
    deliveryChallanDate: { type: Date, default: null }, // Applicable if itemReceivedOn is challan.

    purchaseCost: { type: Number, default: null },
    taxAmount: { type: Number, default: null },
    totalAmount: { type: Number, default: null },
    currency: { type: String, trim: true, default: null },

    deliveryDate: { type: Date, default: null },
    receivedBy: { type: String, trim: true, default: null },

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
  { timestamps: true, collection: "asset_purchases" }
);

purchaseSchema.index(
  { organizationId: 1, assetId: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const Purchase = mongoose.model("Purchase", purchaseSchema);

