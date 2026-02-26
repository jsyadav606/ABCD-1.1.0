import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

// Explicitly load .env from project root to ensure MONGO_URI is available
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Connect to DB directly
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Define Role Schema inline to avoid import issues
const roleSchema = new mongoose.Schema({
  name: String,
  permissionKeys: [String]
}, { collection: 'roles' }); // Force collection name

const Role = mongoose.model("Role", roleSchema);

const fixPermissions = async () => {
  await connectDB();

  const enterpriseAdminPermissions = [
    // Users Module
    "users:access",
    "users:users_list:view",
    "users:users_list:add",
    "users:users_list:edit",
    "users:users_list:delete",
    "users:users_list:disable",
    "users:users_list:enable",
    "users:users_list:change_password",
    "users:users_list:disable_login",
    "users:users_list:enable_login",
    "users:users_list:export",
    "users:users_list:assign_reporting",
    "users:users_list:edit_role",

    // Setup Module
    "setup:access",
    "setup:organization:view",
    "setup:organization:manage",
    "setup:roles:view",
    "setup:roles:manage",
    "setup:branches:view",
    "setup:branches:manage",

    // Assets (Assuming full access for enterprise admin)
    "assets:access",
    "assets:inventory:add",
    "assets:inventory:edit",
    "assets:inventory:delete",
    "assets:inventory:view",
    "assets:inventory:export",
    "assets:accessories:add",
    "assets:accessories:edit",
    "assets:accessories:delete",
    "assets:accessories:view",
    "assets:peripherals:add",
    "assets:peripherals:edit",
    "assets:peripherals:delete",
    "assets:peripherals:view",

    // Reports
    "reports:access",
    "reports:audit_logs:view",
    "reports:audit_logs:export"
  ];

  try {
    // 1. Update Enterprise Admin
    const enterpriseAdmin = await Role.findOne({ name: "enterprise_admin" });
    if (enterpriseAdmin) {
      enterpriseAdmin.permissionKeys = enterpriseAdminPermissions;
      await enterpriseAdmin.save();
      console.log("SUCCESS: Updated 'enterprise_admin' role with full permissions.");
    } else {
      console.log("WARNING: 'enterprise_admin' role not found.");
    }

    // 2. Update Admin (Standard Admin - Branch/Dept level)
    // Giving them user management rights but maybe restricted setup rights
    const adminPermissions = [
        "users:access",
        "users:users_list:view",
        "users:users_list:add",
        "users:users_list:edit",
        "users:users_list:disable", // Can disable but not delete
        "users:users_list:enable",
        "users:users_list:change_password", // Can reset passwords
        "users:users_list:export",
        "users:users_list:assign_reporting",
        // No role editing, no login disabling

        "assets:access",
        "assets:inventory:add",
        "assets:inventory:edit",
        "assets:inventory:view",
        "assets:accessories:add",
        "assets:accessories:edit",
        "assets:accessories:view",
        "assets:peripherals:add",
        "assets:peripherals:edit",
        "assets:peripherals:view",
    ];

    const admin = await Role.findOne({ name: "admin" });
    if (admin) {
        // Only update if it has no keys or very few keys to avoid overwriting custom changes if any
        // But since this is a fix script, we might want to enforce baseline
        admin.permissionKeys = adminPermissions;
        await admin.save();
        console.log("SUCCESS: Updated 'admin' role with standard permissions.");
    } else {
        console.log("WARNING: 'admin' role not found.");
    }

    console.log("Permission fix completed.");
    process.exit(0);
  } catch (err) {
    console.error("Permission fix failed:", err);
    process.exit(1);
  }
};

fixPermissions();
