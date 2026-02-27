import mongoose from "mongoose";

// Utility defaults from ENV with safe fallbacks
const envInt = (key, fallback) => {
  const v = process.env[key];
  const n = v != null ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const DEFAULT_MAX_BRANCHES = envInt("ORG_MAX_BRANCHES", 1);
const DEFAULT_MAX_USERS = envInt("ORG_MAX_USERS", 50);
const DEFAULT_MAX_ASSETS = envInt("ORG_MAX_ASSETS", 500);
const DEFAULT_COUNTRY = process.env.ORG_DEFAULT_COUNTRY || "India";
const DEFAULT_PLAN = process.env.ORG_DEFAULT_PLAN || "FREE";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    userSequence: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Flexible settings bag (Mixed) to allow future-safe org configs
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    sortName: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["SCHOOL_GROUP", "ENTERPRISE", "COMPANY", "NGO"],
      default: "SCHOOL_GROUP",
    },

    registrationDetails: {
      registrationNumber: { type: String, trim: true },
      gstNumber: { type: String, trim: true },
      panNumber: { type: String, trim: true },
      incorporationDate: { type: Date, default: null },
    },

    contactInfo: {
      primaryEmail: { type: String, trim: true, lowercase: true },
      primaryPhone: { type: String, trim: true },
      website: { type: String, trim: true },
    },

    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, default: DEFAULT_COUNTRY, trim: true },
    },

    subscription: {
      planName: {
        type: String,
        enum: ["FREE", "BASIC", "PRO", "ENTERPRISE"],
        default: DEFAULT_PLAN,
      },
      maxBranches: { type: Number, default: DEFAULT_MAX_BRANCHES },
      maxUsers: { type: Number, default: DEFAULT_MAX_USERS },
      maxAssets: { type: Number, default: DEFAULT_MAX_ASSETS },
      startDate: { type: Date, default: null },
      expiryDate: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
    },

    assetStats: {
      totalAssets: { type: Number, default: 0 },
      assignedAssets: { type: Number, default: 0 },
      inRepair: { type: Number, default: 0 },
      disposed: { type: Number, default: 0 },
    },

    branches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],

    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      index: true,
    },

    metadata: {
      logoUrl: { type: String, trim: true },
      description: { type: String, trim: true },
      establishedYear: { type: Number, default: null },
      totalEmployees: { type: Number, default: null },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "organizations",
  }
);

// Ensure uppercase for code and sortName
organizationSchema.pre("validate", function () {
  if (typeof this.code === "string") {
    this.code = this.code.trim().toUpperCase();
  }
  if (typeof this.sortName === "string") {
    this.sortName = this.sortName.trim().toUpperCase();
  }
});

export const Organization = mongoose.model("Organization", organizationSchema);
