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
const { AssetCategory } = await import("../models/assetcategory.model.js");

async function testCategories() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Connected successfully!");

    console.log("\n=== ALL CATEGORIES ===");
    const allCategories = await AssetCategory.find({});
    allCategories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat._id}, Active: ${cat.isActive}, Deleted: ${cat.isDeleted})`);
    });

    console.log("\n=== ACTIVE CATEGORIES ===");
    const activeCategories = await AssetCategory.find({ isActive: true, isDeleted: false });
    activeCategories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat._id})`);
    });

    if (activeCategories.length === 0) {
      console.log("\nNo active categories found! Creating default categories...");

      const categoriesData = [
        {
          name: "Fixed Assets",
          code: "fixed",
          description: "Physical assets like computers, monitors, printers, etc.",
          sortOrder: 1,
        },
        {
          name: "Peripherals",
          code: "peripheral",
          description: "Peripheral devices like keyboards, mice, cameras, etc."
          sortOrder: 2,
        },
        {
          name: "Consumables",
          code: "consumable",
          description: "Consumable items like toner, cables, etc.",
          sortOrder: 3,
        },
        {
          name: "Intangible",
          code: "intangible",
          description: "Intangible assets like software licenses, domains, etc.",
          sortOrder: 4,
        },
      ];

      for (const categoryData of categoriesData) {
        const newCategory = await AssetCategory.create({
          ...categoryData,
          isActive: true,
          isDeleted: false,
        });
        console.log(`✓ Created category: ${newCategory.name} (${newCategory.code})`);
      }

      console.log("\n=== AFTER CREATION ===");
      const newActiveCategories = await AssetCategory.find({ isActive: true, isDeleted: false });
      newActiveCategories.forEach(cat => {
        console.log(`- ${cat.name} (ID: ${cat._id})`);
      });
    }

    console.log("\nTest completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testCategories();