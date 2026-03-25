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

async function checkUserCategories() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();
    console.log("✅ Connected successfully!");

    console.log("\n📋 Checking asset_category collection...");

    // Check all documents in asset_category collection
    const allCategories = await AssetCategory.find({});
    console.log(`\nTotal documents in asset_category: ${allCategories.length}`);

    if (allCategories.length === 0) {
      console.log("❌ No documents found in asset_category collection!");
      console.log("💡 Please check:");
      console.log("   1. Collection name is correct (asset_category vs asset_categories)");
      console.log("   2. Database connection is working");
      console.log("   3. Data exists in the collection");
    } else {
      console.log("✅ Found documents:");
      allCategories.forEach((cat, index) => {
        console.log(`${index + 1}. Name: "${cat.name}", Active: ${cat.isActive}, Deleted: ${cat.isDeleted}, ID: ${cat._id}`);
      });

      // Check active categories
      const activeCategories = await AssetCategory.find({ isActive: true, isDeleted: false });
      console.log(`\nActive categories (${activeCategories.length}):`);
      activeCategories.forEach((cat, index) => {
        console.log(`${index + 1}. "${cat.name}" (ID: ${cat._id})`);
      });

      if (activeCategories.length === 0) {
        console.log("⚠️  No active categories found! Categories must have isActive: true and isDeleted: false");
      } else {
        console.log("✅ Active categories found - these should appear in the dropdown!");
      }
    }

    console.log("\n🔍 API Response format check:");
    const apiResponse = {
      success: true,
      data: {
        items: allCategories.map(cat => ({
          _id: cat._id,
          name: cat.name,
          code: cat.code,
          isActive: cat.isActive,
          isDeleted: cat.isDeleted
        })),
        count: allCategories.length
      },
      message: "Asset categories retrieved successfully"
    };
    console.log("Expected API response format:");
    console.log(JSON.stringify(apiResponse, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("💡 Make sure:");
    console.error("   1. MONGO_URI in .env is correct");
    console.error("   2. MongoDB server is running");
    console.error("   3. Collection name matches your data");
    process.exit(1);
  }
}

checkUserCategories();