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

async function seedAndTestCategories() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Connected successfully!");

    console.log("\n📋 Checking existing categories...");
    const existingCategories = await AssetCategory.find({ isActive: true, isDeleted: false });

    if (existingCategories.length > 0) {
      console.log("✅ Categories already exist:");
      existingCategories.forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat._id})`);
      });
    } else {
      console.log("⚠️  No active categories found. Creating default categories...");

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
          description: "Peripheral devices like keyboards, mice, webcams, etc.",
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
        console.log(`✅ Created category: ${newCategory.name} (${newCategory.code})`);
      }

      console.log("\n📋 Verifying created categories:");
      const newCategories = await AssetCategory.find({ isActive: true, isDeleted: false });
      newCategories.forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat._id})`);
      });
    }

    console.log("\n🎉 Categories are ready! You can now use the Add Item page.");
    console.log("   Make sure your backend server is running on port 4000.");
    console.log("   Frontend should automatically fetch categories from /api/v1/assetcategories/active/list");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("💡 Make sure:");
    console.error("   1. MongoDB connection string is correct in .env");
    console.error("   2. MongoDB server is running");
    console.error("   3. Network connectivity is working");
    process.exit(1);
  }
}

seedAndTestCategories();