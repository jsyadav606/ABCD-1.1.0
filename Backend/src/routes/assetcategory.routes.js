/**
 * Asset Category Routes
 * Description: CRUD endpoints for asset categories
 * - POST   /api/v1/assetcategories              -> create
 * - GET    /api/v1/assetcategories              -> list with pagination
 * - GET    /api/v1/assetcategories/active/list  -> list active categories
 * - GET    /api/v1/assetcategories/:id          -> get by id
 * - PUT    /api/v1/assetcategories/:id          -> update
 * - DELETE /api/v1/assetcategories/:id          -> delete (soft delete)
 */
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createAssetCategory,
  getAllAssetCategories,
  getAssetCategoryById,
  updateAssetCategory,
  deleteAssetCategory,
  getActiveAssetCategories,
} from "../controllers/assetcategory.controller.js";

const router = express.Router();

// Apply authentication to all routes
router.use(verifyJWT);

/**
 * POST: Create new asset category
 */
router.post("/", createAssetCategory);

/**
 * GET: List all asset categories with pagination
 */
router.get("/", getAllAssetCategories);

/**
 * GET: List only active asset categories
 * Note: This route must come before /:id to avoid treating "active" as an ID
 */
router.get("/active/list", getActiveAssetCategories);

/**
 * GET: Get asset category by ID
 */
router.get("/:id", getAssetCategoryById);

/**
 * PUT: Update asset category
 */
router.put("/:id", updateAssetCategory);

/**
 * DELETE: Delete asset category (soft delete)
 */
router.delete("/:id", deleteAssetCategory);

export default router;
