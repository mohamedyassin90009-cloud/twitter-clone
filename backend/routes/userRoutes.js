import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:username", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.patch("/updateMe", protectRoute, updateUser);

export default router;
