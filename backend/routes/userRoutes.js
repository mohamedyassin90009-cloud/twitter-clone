import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateMe,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:username", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.patch("/updateMe", protectRoute, updateMe);

export default router;
