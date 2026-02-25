import dotenv from "dotenv";
import path from "path";

// Explicitly load .env from project root to ensure MONGO_URI is available
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Use top-level await to dynamically import modules after env is loaded
const { default: connectDB } = await import("../config/db.js");
const { Role } = await import("../models/role.model.js");
const { User } = await import("../models/user.model.js");
const { Organization } = await import("../models/organization.model.js");

async function seedRoles() {
  try {
    await connectDB();

    // 1) Ensure an organization exists for the seed user
    let org = await Organization.findOne({ code: "seed_org" });
    if (!org) {
      org = await Organization.create({
        name: "ABCD",
        code: "abcd",
        contactEmail: "abcd@local",
      });
      console.log("Created organization:", org._id.toString());
    } else {
      console.log("Using existing organization:", org._id.toString());
    }

    // 2) Ensure a seed user exists (will act as createdBy for roles)
    let seedUser = await User.findOne({ userId: "seed-super-admin", organizationId: org._id });
    if (!seedUser) {
      seedUser = await User.create({
        userId: "seed-super-admin",
        name: "Seed Super Admin",
        role: "super_admin",
        organizationId: org._id,
        canLogin: true,
        isActive: true,
      });
      console.log("Created seed user:", seedUser._id.toString());
    } else {
      console.log("Using existing seed user:", seedUser._id.toString());
    }

    // 3) Initialize system roles using Role helper
    await Role.initializeSystemRoles(seedUser._id);
    console.log("System roles initialized/ensured.");

    // 4) Ensure a granular "user_admin" role exists with specific permission keys
    const existingUserAdmin = await Role.findOne({ name: "user_admin", isDeleted: false });
    const userAdminPermissions = [
      "users:add_user",
      "users:disable_user",
      "users:edit",
      "users:inactive",
      "users:disable_login",
      "users:change_password",
    ];

    if (!existingUserAdmin) {
      await Role.create({
        name: "user_admin",
        displayName: "User Admin",
        description: "Can manage users and related actions",
        category: "custom",
        priority: 20,
        isActive: true,
        isDefault: false,
        createdBy: seedUser._id,
        permissionKeys: userAdminPermissions,
        permissions: [
          { resource: "users", actions: ["read", "update"] },
        ],
      });
      console.log("Created custom role: user_admin");
    } else {
      // Update permissionKeys if missing any
      const current = new Set(existingUserAdmin.permissionKeys || []);
      let updated = false;
      for (const k of userAdminPermissions) {
        if (!current.has(k)) {
          existingUserAdmin.permissionKeys.push(k);
          updated = true;
        }
      }
      if (updated) {
        await existingUserAdmin.save();
        console.log("Updated user_admin role permissionKeys");
      } else {
        console.log("user_admin role already up to date");
      }
    }

    // Done
    console.log("Role seed completed.");
    process.exit(0);
  } catch (err) {
    console.error("Role seed failed:", err);
    process.exit(1);
  }
}

seedRoles();
