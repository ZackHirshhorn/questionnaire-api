import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import {
  createQuestionnaire,
  getQuestionnairesByUser,
  getQuestionnairesById,
  updateByAuthUser,
  updateQuestionnaire
} from "../controllers/questionnaireController";

const router = express.Router();

router.route("/").post(createQuestionnaire);
router.route("/user").get(protect, getQuestionnairesByUser);
router.route("/:id").get(getQuestionnairesById);
router.route("/:id/answer").put(updateQuestionnaire);
router.route("/:id/answer/auth").put(protect, updateByAuthUser);

export default router;
