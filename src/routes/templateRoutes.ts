import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import {
  createTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  searchByName,
} from "../controllers/templateController";

const router = express.Router();

router.route("/search").get(protect, admin, searchByName);
router.route("/").post(protect, admin, createTemplate);
router
  .route("/:id")
  .get(protect, admin, getTemplateById)
  .put(protect, admin, updateTemplate)
  .delete(protect, admin, deleteTemplate);

export default router;
