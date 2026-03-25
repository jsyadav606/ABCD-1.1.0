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

async function seedAssetCategories() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Missing MONGO_URI");
      process.exit(1);
    }

    await connectDB();

    for (const categoryData of categoriesData) {
      const existing = await AssetCategory.findOne({
        $or: [
          { name: categoryData.name },
          { code: categoryData.code }
        ],
        isDeleted: false
      });

      if (existing) {
        console.log(`Category ${categoryData.name} already exists`);
        continue;
      }

      const newCategory = await AssetCategory.create({
        ...categoryData,
        isActive: true,
        isDeleted: false,
      });

      console.log(`Created category: ${newCategory.name} (${newCategory.code})`);
    }

    console.log("Asset categories seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding asset categories:", error);
    process.exit(1);
  }
}

seedAssetCategories();