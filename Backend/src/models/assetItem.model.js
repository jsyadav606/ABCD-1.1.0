import mongoose from "mongoose";

const valueSchema = new mongoose.Schema(
  {
    fieldKey: { type: String, required: true, lowercase: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const assetItemSchema = new mongoose.Schema(
  {
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "AssetTemplate", required: true },
    templateVersion: { type: Number, required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, default: "" },
    category: { type: String, enum: ["FIXED", "CONSUMABLE", "INTANGIBLE"], required: true },
    status: { type: String, default: "IN_STOCK" },
    values: { type: [valueSchema], default: [] },
    attachments: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    metadata: { type: Map, of: String, default: new Map() },
  },
  { timestamps: true, collection: "asset_items" }
);

assetItemSchema.index({ templateId: 1, branchId: 1, isDeleted: 1 });
assetItemSchema.index({ category: 1, status: 1, isActive: 1 });
assetItemSchema.index({ createdAt: -1 });

const AssetItem = mongoose.model("AssetItem", assetItemSchema);
export { AssetItem };
