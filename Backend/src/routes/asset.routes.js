/**
 * Asset Routes
 * Description: Assets ke create/list/get endpoints. Auth + permission guards applied.
 * - POST /api/v1/assets       -> create (itemType ke hisaab se handler)
 * - GET  /api/v1/assets       -> list (optional ?itemType=cpu/monitor)
 * - GET  /api/v1/assets/:id   -> get by id (try-all if type missing)
 */
import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import { createAsset, listAssets, getAssetById, countAssets } from "../controllers/asset.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", verifyPermission("assets:access"), createAsset);
router.get("/", verifyPermission("assets:inventory:view"), listAssets);
router.get("/count", 
    // verifyPermission("assets:inventory:view"), 
    countAssets);
router.get("/:id", verifyPermission("assets:inventory:view"), getAssetById);

export default router;
