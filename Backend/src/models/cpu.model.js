import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    kind: { type: String, required: true, enum: ["group", "rows"] },
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    rows: { type: [mongoose.Schema.Types.Mixed], default: undefined },
  },
  { _id: false }
);

const assetSchema = new mongoose.Schema(
  {
    itemCategory: { type: String, required: true, trim: true },
    itemType: { type: String, required: true, trim: true },
    sections: { type: [sectionSchema], default: [] },
    flat: { type: mongoose.Schema.Types.Mixed, default: {} },
    summary: {
      itemName: { type: String, default: null, trim: true },
      itemTag: { type: String, default: null, trim: true },
      barcode: { type: String, default: null, trim: true },
      serialNumber: { type: String, default: null, trim: true },
      manufacturer: { type: String, default: null, trim: true },
      model: { type: String, default: null, trim: true },
    },

    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "asset_cpu" }
);

assetSchema.index({ organizationId: 1, branchId: 1, itemCategory: 1, itemType: 1, isDeleted: 1, createdAt: -1 });
assetSchema.index({ "summary.serialNumber": 1 }, { sparse: true });
assetSchema.index({ "summary.itemTag": 1 }, { sparse: true });

const trimStr = (v) => (typeof v === "string" ? v.trim() : v);

const extractFromSections = (sections, sectionName, key) => {
  const list = Array.isArray(sections) ? sections : [];
  const hit = list.find(
    (s) => s && typeof s === "object" && String(s.name || "").trim().toLowerCase() === String(sectionName).trim().toLowerCase()
  );
  if (!hit || hit.kind !== "group" || !hit.data || typeof hit.data !== "object") return null;
  const val = hit.data[key];
  return val == null ? null : val;
};

assetSchema.pre("validate", function () {
  this.itemCategory = trimStr(this.itemCategory);
  this.itemType = trimStr(this.itemType);

  if (Array.isArray(this.sections)) {
    this.sections = this.sections
      .filter((s) => s && typeof s === "object" && s.name && s.kind)
      .map((s) => ({
        ...s,
        name: trimStr(s.name),
        kind: trimStr(s.kind),
      }));
  }

  if (this.summary) {
    this.summary.itemName = trimStr(this.summary.itemName);
    this.summary.itemTag = trimStr(this.summary.itemTag);
    this.summary.barcode = trimStr(this.summary.barcode);
    this.summary.serialNumber = trimStr(this.summary.serialNumber);
    this.summary.manufacturer = trimStr(this.summary.manufacturer);
    this.summary.model = trimStr(this.summary.model);
  }
});

assetSchema.pre("save", function () {
  const sections = this.sections || [];
  const flat = this.flat && typeof this.flat === "object" ? this.flat : {};

  const summary = this.summary || {};
  const pick = (k) => {
    const fromSec = extractFromSections(sections, "Basic Information", k);
    if (fromSec != null && String(fromSec).trim() !== "") return fromSec;
    const fromFlat = flat?.[k];
    if (fromFlat != null && String(fromFlat).trim() !== "") return fromFlat;
    return null;
  };

  summary.itemName = summary.itemName || pick("itemName") || pick("assetName");
  summary.itemTag = summary.itemTag || pick("itemTag") || pick("assetTag");
  summary.barcode = summary.barcode || pick("barcode");
  summary.serialNumber = summary.serialNumber || pick("serialNumber");
  summary.manufacturer = summary.manufacturer || pick("manufacturer") || pick("cpuManufacturer");
  summary.model = summary.model || pick("model") || pick("cpuModel");

  this.summary = summary;
});

const CPU = mongoose.model("CPU", assetSchema);
export { CPU };
