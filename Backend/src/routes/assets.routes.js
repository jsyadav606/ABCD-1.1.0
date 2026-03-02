import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyPermission } from "../middlewares/permission.middleware.js";
import {
  createTemplate,
  publishTemplate,
  updateTemplate,
  getTemplateById,
  listTemplates,
  createItem,
  listItems,
  listCatalogFields,
  createCatalogField,
} from "../controllers/assets.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/templates", verifyPermission("assets:templates:view"), listTemplates);
router.get("/templates/:id", verifyPermission("assets:templates:view"), getTemplateById);
router.post("/templates", verifyPermission("assets:templates:manage"), createTemplate);
router.post("/templates/:id/publish", verifyPermission("assets:templates:manage"), publishTemplate);
router.put("/templates/:id", verifyPermission("assets:templates:manage"), updateTemplate);

router.get("/items", verifyPermission("assets:items:view"), listItems);
router.post("/items", verifyPermission("assets:items:create"), createItem);

router.get("/catalog/fields", verifyPermission("assets:templates:view"), listCatalogFields);
router.post("/catalog/fields", verifyPermission("assets:templates:manage"), createCatalogField);

export default router;
