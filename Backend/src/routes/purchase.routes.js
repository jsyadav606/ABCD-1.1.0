import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import { getPurchaseByAsset, upsertPurchaseByAsset } from "../controllers/purchase.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.put("/asset/:assetId", verifyPermission("assets:access"), upsertPurchaseByAsset);
router.get("/asset/:assetId", verifyPermission("assets:inventory:view"), getPurchaseByAsset);

export default router;

