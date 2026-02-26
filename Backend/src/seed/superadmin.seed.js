import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import dns from "dns";

// Fix for ECONNREFUSED DNS issue by using Google DNS
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (error) {
  console.warn("Could not set custom DNS servers:", error.message);
}

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { default: connectDB } = await import("../config/db.js");
const { Role } = await import("../models/role.model.js");
const { User } = await import("../models/user.model.js");
const { UserLogin } = await import("../models/userLogin.model.js");
const { Organization } = await import("../models/organization.model.js");

async function seedSuperAdmin() {
  try {
    // Ensure MONGO URI is available
    if (!process.env.MONGO_URI) {
      console.error("Missing MONGO_URI in environment. Please set MONGO_URI in your .env file before running the seed.");
      process.exit(1);
    }

    await connectDB();

    // Fetch organization by name 'ABCD' (create if missing)
    let org = await Organization.findOne({ name: "ABCD" });
    if (!org) {
      org = await Organization.create({
        name: "ABCD",
        code: "abcd",
        contactEmail: "abcd@local",
        isActive: true,
      });
      console.log("Created organization:", org._id.toString());
    } else {
      org.name = "ABCD";
      org.code = "abcd";
      org.contactEmail = "abcd@local";
      org.isActive = true;
      await org.save();
      console.log("Using existing organization:", org._id.toString());
    }

    // Find role by name 'super_admin'. If missing, will create after user is created
    let superRole = await Role.findOne({ name: "super_admin", isDeleted: false });
    
    // Create the first super admin user (if not exists)
    let superUser = await User.findOne({ userId: "superadmin", organizationId: org._id });
    if (!superUser) {
      superUser = await User.create({
        userId: "superadmin",
        name: "Super Admin",
        email: "superadmin@abcd.com",
        gender: "Male",
        phone_no: 1234567890,
        roleId: superRole ? superRole._id : null,
        organizationId: org._id,
        organizationName: org.name,
        canLogin: true,
        isActive: true,
      });
      console.log("Created super admin user:", superUser._id.toString());
    } else {
      // ensure flags and roleId are set
      superUser.roleId = superRole ? superRole._id : superUser.roleId;
      superUser.canLogin = true;
      superUser.isActive = true;
      await superUser.save();
      console.log("Using existing super admin user:", superUser._id.toString());
    }

    // If role didn't exist earlier, create it now with createdBy = superUser._id and the provided ROLE_ID
    if (!superRole) {
      superRole = await Role.create({
        name: "super_admin",
        displayName: "Super Administrator",
        description: "Full system access",
        category: "system",
        priority: 1,
        isActive: true,
        isDefault: false,
        createdBy: superUser._id,
        permissionKeys: ["*"], // Grant all permissions
        permissions: [],
      });
      console.log("Created super_admin role:", superRole._id.toString());

      // Ensure user's roleId is set
      superUser.roleId = superRole._id;
      await superUser.save();
    } else {
      // Ensure wildcard permission exists
      const keys = new Set(superRole.permissionKeys || []);
      if (!keys.has("*")) {
        superRole.permissionKeys.push("*");
        await superRole.save();
        console.log("Updated super_admin role to include '*' permission");
      }
      
      // Ensure user is linked to role
      if (!superUser.roleId || superUser.roleId.toString() !== superRole._id.toString()) {
        superUser.roleId = superRole._id;
        await superUser.save();
        console.log("Linked super admin user to super_admin role");
      }
    }

    // Create UserLogin entry (Authentication)
    let userLogin = await UserLogin.findOne({ user: superUser._id });
    if (!userLogin) {
      // Default password: 'password123' (will be hashed by pre-save hook)
      userLogin = await UserLogin.create({
        user: superUser._id,
        username: "superadmin",
        password: "password123", 
        forcePasswordChange: false,
        isLoggedIn: false,
        lockLevel: 0,
        failedLoginAttempts: 0
      });
      console.log("Created UserLogin credentials for superadmin");
    } else {
      // Optional: Reset password if needed (uncomment to reset)
      // userLogin.password = "password123";
      // await userLogin.save();
      console.log("UserLogin credentials already exist");
    }

    console.log("Super Admin Seed Completed Successfully!");
    process.exit(0);

  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
