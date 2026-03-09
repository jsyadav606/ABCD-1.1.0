import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, trim: true, default: "India" },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    designation: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },

    gstNumber: { type: String, trim: true, uppercase: true },
    panNumber: { type: String, trim: true, uppercase: true },

    address: addressSchema,
    billingAddress: addressSchema,
    shippingAddress: addressSchema,

    contacts: [contactSchema],
    tags: { type: [String], default: [] },

    notes: { type: String, trim: true },

    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "vendors" }
);

vendorSchema.index(
  { organizationId: 1, code: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { code: { $type: "string" } } }
);
vendorSchema.index({ organizationId: 1, name: 1, isDeleted: 1 });
vendorSchema.index({ createdAt: -1 });

vendorSchema.pre("validate", function () {
  if (typeof this.code === "string") {
    this.code = this.code.trim().toUpperCase();
  }
  if (typeof this.gstNumber === "string") {
    this.gstNumber = this.gstNumber.trim().toUpperCase();
  }
  if (typeof this.panNumber === "string") {
    this.panNumber = this.panNumber.trim().toUpperCase();
  }
});

export const Vendor = mongoose.model("Vendor", vendorSchema);

