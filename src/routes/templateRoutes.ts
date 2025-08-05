import express from "express";
import { admin, protect, superAdmin } from "../middlewares/authMiddleware";
import {
  createTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  searchByName,
} from "../controllers/templateController";

const router = express.Router();

router.route("/search").get(protect, superAdmin, searchByName);
router.route("/").post(protect, admin, createTemplate);
router
  .route("/:id")
  .get(protect, admin, getTemplateById)
  .put(protect, admin, updateTemplate)
  .delete(protect, admin, deleteTemplate);

export default router;
