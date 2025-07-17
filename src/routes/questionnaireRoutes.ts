import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import {
  createQuestionnaire,
  getQuestionnairesByUser,
} from "../controllers/questionnaireController";

const router = express.Router();

router.route("/").post(createQuestionnaire);
router.route("/user").get(protect, getQuestionnairesByUser);

export default router;
