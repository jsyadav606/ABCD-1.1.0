import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import { getWarrantyByAsset, upsertWarrantyByAsset } from "../controllers/warranty.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.put("/asset/:assetId", verifyPermission("assets:access"), upsertWarrantyByAsset);
router.get("/asset/:assetId", verifyPermission("assets:inventory:view"), getWarrantyByAsset);

export default router;

