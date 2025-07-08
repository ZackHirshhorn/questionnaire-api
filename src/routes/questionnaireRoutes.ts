import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import {
  createQuestionnaire,
  getQuestionnairesByUser,
} from "../controllers/questionnaireController";

const router = express.Router();

router.route("/").post(createQuestionnaire);
router.route("/user/:userId").get(getQuestionnairesByUser);

export default router;
