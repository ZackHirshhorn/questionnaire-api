import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";

import {
  createQuestionsCol,
  searchByName,
  getQuestionsColById,
  updatedQuestionsCol,
  deleteQuestionsCol,
} from "../controllers/questionsController";

const router = express.Router();

router.route("/search").get(protect, admin, searchByName);
router
  .route("/:id")
  .get(protect, admin, getQuestionsColById)
  .put(protect, admin, updatedQuestionsCol)
  .delete(protect, admin, deleteQuestionsCol);
router.route("/").post(protect, admin, createQuestionsCol);

export default router;
