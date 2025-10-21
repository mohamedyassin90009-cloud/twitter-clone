import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  getAllPosts,
  createPost,
  deletePost,
  addComment,
  likeUnlikePost,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", protectRoute, getAllPosts);

router.get("/liked/:id", protectRoute, getLikedPosts);

router.get("/user/:username", protectRoute, getUserPosts);

router.post("/", protectRoute, createPost);

router.delete("/:id", protectRoute, deletePost);

router.post("/comment/:id", protectRoute, addComment);

router.post("/like/:id", protectRoute, likeUnlikePost);

router.get("/following", protectRoute, getFollowingPosts);

export default router;
