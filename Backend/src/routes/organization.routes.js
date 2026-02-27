import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import {
  listOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getUserIdSequenceConfig,
  updateUserIdSequenceConfig,
} from "../controllers/organization.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", verifyPermission("setup:organization:view"), listOrganizations);
router.get("/:id", verifyPermission("setup:organization:view"), getOrganizationById);
router.get("/:id/user-id-sequence", verifyPermission("setup:organization:manage"), getUserIdSequenceConfig);
router.put("/:id/user-id-sequence", verifyPermission("setup:organization:manage"), updateUserIdSequenceConfig);
router.post("/", verifyPermission("setup:organization:manage"), createOrganization);
router.put("/:id", verifyPermission("setup:organization:manage"), updateOrganization);
router.delete("/:id", verifyPermission("setup:organization:manage"), deleteOrganization);

export default router;

