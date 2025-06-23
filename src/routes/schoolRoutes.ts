import express from "express";
import { admin, protect } from "../middlewares/authMiddleware";
import { createSchool } from "../controllers/schoolController";

const router = express.Router();

router.route("/").post(protect, admin, createSchool);

export default router;
