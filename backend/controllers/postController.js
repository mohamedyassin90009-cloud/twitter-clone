import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import AppError from "../util/appError.js";
import catchAsync from "../util/catchAsync.js";
import cloudinary from "../../config/cloudinary.js";
import Notification from "../models/notificationModel.js";

export const createPost = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  let { img } = req.body;
  const userId = req.user._id.toString();

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!text && !img) {
    return next(new AppError("Post must have text or image", 400));
  }

  if (img) {
    const uploadedResponse = await cloudinary.uploader.upload(img);
    img = uploadedResponse.secure_url;
  }

  const newPost = new Post({
    user: userId,
    text,
    img,
  });

  await newPost.save();
  res.status(201).json(newPost);
});

// Get All post
export const getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find()
    .populate("user", "username avatar")
    .sort({ createdAt: -1 })
    .populate("comments.user", "username avatar");

  res.status(200).json(posts);
});

// Delete post
export const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found.", 404));

  // Only post owner can delete
  if (post.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError("You are not authorized to delete this post.", 403)
    );
  }

  // Optional: delete image from Cloudinary
  if (post.image) {
    const publicId = post.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`twitter-clone/posts/${publicId}`);
  }

  await post.deleteOne();

  res.status(204).json({
    status: "success",
    message: "Post deleted successfully",
  });
});

// add comment
export const addComment = catchAsync(async (req, res, next) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return next(new AppError("Comment text is required.", 400));
  }

  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found.", 404));

  const comment = {
    user: req.user._id,
    text,
  };

  post.comments.push(comment);
  await post.save();

  res.status(201).json(post);
});

export const likeUnlikePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) return next(new AppError("Post not found.", 404));

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found.", 404));

  // Check if the user already liked the post
  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    // Unlike: remove user ID from likes array
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    user.likedPosts = user.likedPosts.filter(
      (id) => id.toString() !== post._id.toString()
    );
  } else {
    // Like: add user ID to likes array
    post.likes.push(userId);
    user.likedPosts.push(post._id);
    // console.log(likedPosts);

    // ✅ Add notification for post owner if not liking own post

    if (post.user.toString() !== userId.toString()) {
      await Notification.create({
        // user: post.user, // post owner
        recipient: post.user,
        sender: userId, // liker
        type: "like",
        post: post._id,
      });
    }
  }

  await post.save();

  res.status(200).json({
    status: "success",
    message: alreadyLiked ? "Post unliked." : "Post liked.",
    likesCount: post.likes.length,
    liked: !alreadyLiked,
  });
});

export const getLikedPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) return next(new AppError("User not found", 404));

  const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
    .populate({
      path: "user",
      select: "-password",
    })
    .populate({
      path: "comments.user",
      select: "-password",
    });

  res.status(200).json(likedPosts);
});

export const getFollowingPosts = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (!user) return next(new AppError("User not found", 404));

  const following = user.following;

  const followingPosts = await Post.find({ user: { $in: following } })
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "-password",
    })
    .populate({
      path: "comments.user",
      select: "-password",
    });

  res.status(200).json(followingPosts);
});

export const getUserPosts = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) return next(new AppError("User not found", 404));

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
      select: "password",
    })
    .populate({
      path: "comments.user",
      select: "-password",
    });

  res.status(200).json(posts);
});
