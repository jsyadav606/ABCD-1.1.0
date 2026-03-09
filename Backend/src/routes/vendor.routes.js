import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import {
  createVendor,
  listVendors,
  getVendorById,
  updateVendor,
  softDeleteVendor,
  toggleVendorActive,
  getVendorsForDropdown,
} from "../controllers/catalog/vendor.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/dropdown", verifyPermission("setup:vendors:view"), getVendorsForDropdown);

router.get("/", verifyPermission("setup:vendors:view"), listVendors);
router.get("/:id", verifyPermission("setup:vendors:view"), getVendorById);
router.post("/", verifyPermission("setup:vendors:manage"), createVendor);
router.put("/:id", verifyPermission("setup:vendors:manage"), updateVendor);
router.delete("/:id", verifyPermission("setup:vendors:manage"), softDeleteVendor);
router.post("/:id/toggle-active", verifyPermission("setup:vendors:manage"), toggleVendorActive);

export default router;

