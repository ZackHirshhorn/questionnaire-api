import express from "express";
import { admin, protect, superAdmin } from "../middlewares/authMiddleware";
import {
  createTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  searchByName,
  getTemplatesByUser,
  getAllTemplates,
} from "../controllers/templateController";

const router = express.Router();

router.route("/user").get(protect, admin, getTemplatesByUser);
router.route("/search").get(protect, superAdmin, searchByName);
router
  .route("/")
  .post(protect, admin, createTemplate)
  .get(protect, superAdmin, getAllTemplates);
router
  .route("/:id")
  .get(protect, admin, getTemplateById)
  .put(protect, admin, updateTemplate)
  .delete(protect, admin, deleteTemplate);

export default router;
