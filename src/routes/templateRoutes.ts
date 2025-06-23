import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import { createTemplate, getTemplate } from "../controllers/templateController";

const router = express.Router();

router.route("/").post(protect, admin, createTemplate);
router.route("/:id").get(protect, admin, getTemplate);

export default router;
