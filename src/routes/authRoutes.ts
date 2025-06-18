import express from "express";
import { register, login, logout } from "../controllers/authController";

const router = express.Router();

router.route("/").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);

export default router;
