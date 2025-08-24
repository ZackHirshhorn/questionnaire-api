import express from "express";
import { admin, protect, superAdmin } from "../middlewares/authMiddleware";

import {
  createQuestionsCol,
  searchByName,
  getQuestionsColById,
  updatedQuestionsCol,
  deleteQuestionsCol,
  getQuestionsColByUser
} from "../controllers/questionsController";

const router = express.Router();

router.route("/").post(protect, admin, createQuestionsCol);
router.route("/search").get(protect, superAdmin, searchByName);
router.route("/user").get(protect, admin, getQuestionsColByUser);
router
  .route("/:id")
  .get(protect, admin, getQuestionsColById)
  .put(protect, admin, updatedQuestionsCol)
  .delete(protect, admin, deleteQuestionsCol);

export default router;
