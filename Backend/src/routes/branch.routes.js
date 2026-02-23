import express from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  listBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branch.controller.js";

const router = express.Router();

router.use(verifyJWT, verifyAdmin);

router.get("/", listBranches);
router.get("/:id", getBranchById);
router.post("/", createBranch);
router.put("/:id", updateBranch);
router.delete("/:id", deleteBranch);

export default router;

