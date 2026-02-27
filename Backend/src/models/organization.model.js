import mongoose from "mongoose";

const organizationSettingsSchema = new mongoose.Schema(
  {
    auth: {
      roleLoginEnabled: { type: Boolean, default: false },
      allowedLoginRoles: { type: [String], default: [] },
    },
    passwordPolicy: {
      enabled: { type: Boolean, default: false },
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: false },
      requireLowercase: { type: Boolean, default: false },
      requireNumber: { type: Boolean, default: false },
      requireSpecial: { type: Boolean, default: false },
    },
    notifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    confirmationEmail: {
      enabled: { type: Boolean, default: false },
      sendOnUserCreate: { type: Boolean, default: false },
      subject: { type: String, default: "", trim: true },
      body: { type: String, default: "", trim: true },
    },
  },
  { _id: false }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, unique: true, sparse: true },
    address: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    enabledFeatures: { type: [String], default: [] },
    settings: { type: organizationSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Organization = mongoose.model("Organization", organizationSchema);
