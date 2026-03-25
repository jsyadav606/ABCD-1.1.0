/**
 * Model: Asset Category
 * Description: Asset categories (CPU, Monitor, Laptop, etc.)
 * Collection: asset_categories
 */
import mongoose from "mongoose";

const assetCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // This allows multiple missing values
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "asset_categories",
  }
);

// Ensure code index with sparse option
assetCategorySchema.index({ code: 1 }, { unique: true, sparse: true });

export const AssetCategory = mongoose.model("AssetCategory", assetCategorySchema);
