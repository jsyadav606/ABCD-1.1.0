import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { default: connectDB } = await import("../config/db.js");
const { Branch } = await import("../models/branch.model.js");
const { Organization } = await import("../models/organization.model.js");

async function seedBranches() {
  try {
    // Ensure MONGO URI is available
    if (!process.env.MONGO_URI) {
      console.error("Missing MONGO_URI in environment. Please set MONGO_URI in your .env file before running the seed.");
      process.exit(1);
    }

    await connectDB();

    const orgId = "6991f27977da956717ec33f5";

    // Check if organization exists
    const org = await Organization.findById(orgId);
    if (!org) {
      console.error(`Organization with ID ${orgId} not found.`);
      process.exit(1);
    }

    console.log(`Using organization: ${org.name} (${orgId})`);

    // Define branches to seed
    const branchesToSeed = [
      { name: "ABCD East", code: "abcd-east" },
      { name: "ABCD West", code: "abcd-west" },
      { name: "ABCD North", code: "abcd-north" },
      { name: "ABCD South", code: "abcd-south" },
      { name: "Center", code: "center" },
    ];

    // Create or update branches
    for (const branchData of branchesToSeed) {
      const existingBranch = await Branch.findOne({ 
        name: branchData.name, 
        organizationId: orgId 
      });

      if (existingBranch) {
        console.log(`Branch '${branchData.name}' already exists. Skipping...`);
      } else {
        const newBranch = await Branch.create({
          ...branchData,
          organizationId: orgId,
          isActive: true,
        });
        console.log(`✅ Created branch: ${newBranch.name} (${newBranch._id.toString()})`);
      }
    }

    console.log("\n✅ Branch seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding branches:", error.message);
    process.exit(1);
  }
}

seedBranches();
