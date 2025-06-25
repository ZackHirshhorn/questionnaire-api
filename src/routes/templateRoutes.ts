import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import {
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templateController";

const router = express.Router();

router.route("/").post(protect, admin, createTemplate);
router
  .route("/:id")
  .get(protect, admin, getTemplate)
  .put(protect, admin, updateTemplate)
  .delete(protect, admin, deleteTemplate);

export default router;
