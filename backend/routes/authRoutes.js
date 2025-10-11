import express from "express";
import { signup, login, logout, getMe } from "../controllers/authController.js";
import protect from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protect, getMe);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
