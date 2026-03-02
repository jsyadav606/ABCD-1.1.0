import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, lowercase: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "number",
        "integer",
        "currency",
        "date",
        "datetime",
        "duration",
        "select",
        "multiselect",
        "boolean",
        "file",
        "reference",
        "computed",
      ],
    },
    widget: { type: String, default: null },
    required: { type: Boolean, default: false },
    defaultValue: { type: mongoose.Schema.Types.Mixed, default: null },
    validations: {
      required: false,
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    options: [
      {
        _id: false,
        value: { type: String, required: true },
        label: { type: String, required: true },
        order: { type: Number, default: 0 },
        sourceType: { type: String, default: "static" },
        sourceRef: { type: String, default: null },
      },
    ],
    conditionalRules: {
      required: false,
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    section: { type: String, default: null },
    auditable: { type: Boolean, default: false },
    primary: { type: Boolean, default: false },
  },
  { _id: false }
);

const assetTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["FIXED", "CONSUMABLE", "INTANGIBLE"],
    },
    visibility: { type: String, enum: ["global", "branch"], default: "global" },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    allowedBranchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Branch" }],
    status: { type: String, enum: ["Draft", "Published", "Deprecated"], default: "Draft" },
    version: { type: Number, default: 1 },
    fields: { type: [fieldSchema], default: [] },
    schemaJson: { type: Object, default: {} },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    metadata: { type: Map, of: String, default: new Map() },
  },
  { timestamps: true, collection: "asset_templates" }
);

assetTemplateSchema.index({ organizationId: 1, name: 1, isDeleted: 1 }, { unique: true });
assetTemplateSchema.index({ category: 1, status: 1, isActive: 1 });
assetTemplateSchema.index({ createdAt: -1 });

assetTemplateSchema.pre("validate", function () {
  if (typeof this.name === "string") this.name = this.name.trim();
  if (Array.isArray(this.fields)) {
    const keys = this.fields.map((f) => String(f.key || "").trim().toLowerCase());
    const unique = new Set(keys);
    if (unique.size !== keys.length) {
      throw new Error("Duplicate field keys are not allowed");
    }
  }
});

const AssetTemplate = mongoose.model("AssetTemplate", assetTemplateSchema);
export { AssetTemplate };
