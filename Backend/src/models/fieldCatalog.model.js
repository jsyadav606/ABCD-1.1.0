import mongoose from "mongoose";

const fieldCatalogSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, lowercase: true, trim: true, unique: true },
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
    validations: {
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
      },
    ],
    tags: [{ type: String }], 
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "field_catalog" }
);

fieldCatalogSchema.index({ key: 1 }, { unique: true });
fieldCatalogSchema.index({ tags: 1, isActive: 1 });

const FieldCatalog = mongoose.model("FieldCatalog", fieldCatalogSchema);
export { FieldCatalog };
