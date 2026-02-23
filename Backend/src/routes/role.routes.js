import express from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  listRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/role.controller.js";

const router = express.Router();

router.use(verifyJWT, verifyAdmin);

router.get("/", listRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;

