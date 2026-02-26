import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    // Role Identity
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
      example: "super_admin",
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
      example: "Super Administrator",
    },

    description: {
      type: String,
      trim: true,
      default: null,
      example: "Full system access with all permissions",
    },

    // Role Scope
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      note: "null = system role, otherwise organization-specific role",
    },

    // Role Category/Type
    category: {
      type: String,
      enum: ["system", "custom"],
      default: "custom",
      note: "system = predefined, custom = user-created",
    },

    priority: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000,
      note: "Higher priority overrides lower priority when conflicts occur. System roles: 1-10, Custom roles: 11-999",
    },

    // Permissions - Simplified for Master Prompt
    permissions: [
      {
        _id: false,
        resource: {
          type: String,
          required: true,
          lowercase: true,
          example: "users, reports, dashboard",
        },
        actions: {
          type: [String],
          default: [],
          example: ["create", "read", "update", "delete"],
        },
      },
    ],

    permissionKeys: {
      type: [String],
      default: [],
    },

    // Role Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
      note: "Should this be assigned by default to new users?",
    },

    // Audit Trail
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

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // Notes/Metadata
    metadata: {
      type: Map,
      of: String,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    collection: "roles",
  }
);

// =====================================================
// INDEXES
// =====================================================
roleSchema.index({ organizationId: 1, name: 1, isDeleted: 1 }, { unique: true });
roleSchema.index({ organizationId: 1, isActive: 1 });
roleSchema.index({ category: 1 });
roleSchema.index({ priority: -1 });
roleSchema.index({ isDeleted: 1 });
roleSchema.index({ createdAt: -1 });
// Compound indexes should be defined with `index()` in Mongoose
roleSchema.index({ organizationId: 1, isActive: 1, isDeleted: 1 });

// =====================================================
// HOOKS
// =====================================================

roleSchema.pre("validate", function () {
  if (typeof this.name === "string") {
    this.name = this.name.trim().toLowerCase();
  }
  if (typeof this.displayName === "string") {
    this.displayName = this.displayName.trim();
  }
  if (!this.category) {
    this.category = this.organizationId ? "custom" : "system";
  }
});

roleSchema.pre("save", function () {
  if (Array.isArray(this.permissionKeys)) {
    let keys = this.permissionKeys
      .filter((k) => typeof k === "string")
      .map((k) => k.trim());
    const hasWildcard = keys.includes("*");
    if (hasWildcard) {
      keys = ["*"];
    } else {
      keys = Array.from(new Set(keys.map((k) => k.toLowerCase()))).sort();
    }
    this.permissionKeys = keys;
  } else {
    this.permissionKeys = [];
  }
});

// =====================================================
// METHODS (permissionKeys based)
// =====================================================

roleSchema.methods.hasKey = function (key) {
  if (!this.isActive) return false;
  if (!Array.isArray(this.permissionKeys)) return false;
  return this.permissionKeys.includes("*") || this.permissionKeys.includes(key);
};

roleSchema.methods.hasAnyKeys = function (keys = []) {
  if (!Array.isArray(keys) || keys.length === 0) return false;
  if (!Array.isArray(this.permissionKeys)) return false;
  if (this.permissionKeys.includes("*")) return true;
  return keys.some((k) => this.permissionKeys.includes(String(k)));
};

roleSchema.methods.hasAllKeys = function (keys = []) {
  if (!Array.isArray(keys) || keys.length === 0) return false;
  if (!Array.isArray(this.permissionKeys)) return false;
  if (this.permissionKeys.includes("*")) return true;
  return keys.every((k) => this.permissionKeys.includes(String(k)));
};

roleSchema.methods.getPermissionKeys = function () {
  return Array.isArray(this.permissionKeys) ? this.permissionKeys : [];
};

/**
 * Soft delete role
 * @returns {Promise}
 */
roleSchema.methods.softDelete = async function (deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return await this.save();
};

/**
 * Restore soft deleted role
 * @returns {Promise}
 */
roleSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return await this.save();
};

/**
 * Get role scope/hierarchy
 * @returns {string}
 */
roleSchema.methods.getScope = function () {
  if (this.category === "system") return "SYSTEM";
  if (this.organizationId) return "ORGANIZATION";
  return "CUSTOM";
};

// =====================================================
// STATIC METHODS
// =====================================================

/**
 * Get all system roles
 * @returns {Promise<array>}
 */
roleSchema.statics.getSystemRoles = function () {
  return this.find({
    category: "system",
    isActive: true,
    isDeleted: false,
  }).sort({ priority: 1 });
};

/**
 * Get all organization roles
 * @param {string} organizationId - Organization ID
 * @returns {Promise<array>}
 */
roleSchema.statics.getOrganizationRoles = function (organizationId) {
  return this.find({
    organizationId,
    isActive: true,
    isDeleted: false,
  }).sort({ priority: 1 });
};

/**
 * Get role by name
 * @param {string} name - Role name
 * @param {string} organizationId - Organization ID (optional)
 * @returns {Promise<object>}
 */
roleSchema.statics.getRoleByName = function (name, organizationId = null) {
  const query = {
    name: name.toLowerCase(),
    isActive: true,
    isDeleted: false,
  };

  if (organizationId) {
    query.organizationId = organizationId;
  }

  return this.findOne(query);
};

/**
 * Create default system roles
 * @param {string} createdBy - User ID
 * @returns {Promise}
 */
roleSchema.statics.initializeSystemRoles = async function (createdBy) {
  const defaultRoles = [
    {
      name: "super_admin",
      displayName: "Super Administrator",
      description: "Full system access with all permissions",
      category: "system",
      priority: 1,
      isActive: true,
      isDefault: false,
      createdBy,
      permissions: [],
      permissionKeys: ["*"],
    },
    {
      name: "enterprise_admin",
      displayName: "Enterprise Administrator",
      description: "Full organization-level access",
      category: "system",
      priority: 2,
      isActive: true,
      isDefault: false,
      createdBy,
      permissions: [],
      permissionKeys: [],
    },
    {
      name: "admin",
      displayName: "Administrator",
      description: "Department/branch level admin",
      category: "system",
      priority: 3,
      isActive: true,
      isDefault: false,
      createdBy,
      permissions: [],
      permissionKeys: [],
    },
    {
      name: "user",
      displayName: "Standard User",
      description: "Regular user with basic permissions",
      category: "system",
      priority: 100,
      isActive: true,
      isDefault: true,
      createdBy,
      permissions: [],
      permissionKeys: [],
    },
  ];

  for (const roleData of defaultRoles) {
    const exists = await this.findOne({
      name: roleData.name,
      isDeleted: false,
    });

    if (!exists) {
      await this.create(roleData);
    }
  }
};

// =====================================================
// QUERY MIDDLEWARES
// =====================================================

// Exclude soft deleted records by default
roleSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

roleSchema.query.deleted = function () {
  return this.where({ isDeleted: true });
};

// =====================================================
// PRE-HOOKS
// =====================================================

// Validate organization exists before saving
roleSchema.pre("save", async function () {
  if (this.organizationId && this.category === "custom") {
    const Organization = mongoose.model("Organization");
    const org = await Organization.findById(this.organizationId);
    if (!org) {
      throw new Error("Organization not found");
    }
  }
});

// Validate created by user exists
roleSchema.pre("save", async function () {
  if (!this.isNew) {
    return;
  }
  if (this.createdBy) {
    const User = mongoose.model("User");
    const user = await User.findById(this.createdBy);
    if (!user) {
      throw new Error("Creator user not found");
    }
  }
});

export const Role = mongoose.model("Role", roleSchema);
