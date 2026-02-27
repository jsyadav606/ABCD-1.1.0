import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import {
  listOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organization.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", verifyPermission("setup:organization:view"), listOrganizations);
router.get("/:id", verifyPermission("setup:organization:view"), getOrganizationById);
router.post("/", verifyPermission("setup:organization:manage"), createOrganization);
router.put("/:id", verifyPermission("setup:organization:manage"), updateOrganization);
router.delete("/:id", verifyPermission("setup:organization:manage"), deleteOrganization);

export default router;

