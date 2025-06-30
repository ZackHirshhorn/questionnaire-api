import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  getAllTemplates,
  searchByName,
} from "../controllers/templateController";

const router = express.Router();

router.route("/search").get(protect, admin, searchByName);

router
  .route("/")
  .post(protect, admin, createTemplate)
  .get(protect, admin, getAllTemplates);
router
  .route("/:id")
  .get(protect, admin, getTemplate)
  .put(protect, admin, updateTemplate)
  .delete(protect, admin, deleteTemplate);

export default router;
