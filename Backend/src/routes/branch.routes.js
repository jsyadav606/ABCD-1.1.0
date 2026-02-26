import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import {
  listBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branch.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", verifyPermission("setup:branches:view"), listBranches);
router.get("/:id", verifyPermission("setup:branches:view"), getBranchById);
router.post("/", verifyPermission("setup:branches:manage"), createBranch);
router.put("/:id", verifyPermission("setup:branches:manage"), updateBranch);
router.delete("/:id", verifyPermission("setup:branches:manage"), deleteBranch);

export default router;

