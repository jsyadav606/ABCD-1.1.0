import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", verifyPermission("setup:roles:view"), listRoles);
router.get("/:id", verifyPermission("setup:roles:view"), getRoleById);
router.post("/", verifyPermission("setup:roles:manage"), createRole);
router.put("/:id", verifyPermission("setup:roles:manage"), updateRole);
router.delete("/:id", verifyPermission("setup:roles:manage"), deleteRole);

export default router;

