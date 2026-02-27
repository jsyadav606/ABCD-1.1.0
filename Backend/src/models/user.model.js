import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },
    seqId: {
      type: Number,
      default: null,
      immutable: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      default:"NA",
      trim: true,
    },
    department: {
      type: String,
      default:"NA",
      trim: true,
    },
     gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true
    },
     dob: {
      type: Date,
      default: null
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      note: 'Link to department for scope-based access'
    },

    email: {
      type: String,
    //   required: true,
      trim: true,
    },

    personalEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },

    phone_no: {
      type: Number,
      trim: true,
      length: 10,
    },

    // NEW: Role-based permission system (Enterprise feature)
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
      note: 'Link to new Role model for granular permissions'
    },

    canLogin:{
      type:Boolean,
      default:false
    },

     dateOfJoining: {
      type: Date,
      default: null
    },


    permissions: [String],

    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    branchId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],

    primaryBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    assignedBranches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
      default: '',
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Indexes for better query performance
userSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
userSchema.index({ organizationId: 1, seqId: 1 }, { unique: true });
userSchema.index({ email: 1 });
userSchema.index({ organizationId: 1 });
// Use roleId index (role string removed in new schema)
userSchema.index({ roleId: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isBlocked: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model("User", userSchema);
