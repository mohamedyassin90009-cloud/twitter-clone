import AppError from "../util/appError.js";
import catchAsync from "../util/catchAsync.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import cloudinary from "../../config/cloudinary.js";

export const getUserProfile = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("-password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json(user);
});

export const followUnfollowUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userToFollow = await User.findById(id);
  const currentUser = await User.findById(req.user._id);

  if (!userToFollow) return next(new AppError("User not found", 404));

  if (userToFollow._id.equals(req.user._id))
    return next(new AppError("You cannot follow yourself.", 400));

  const isFollowing = currentUser.following.includes(userToFollow._id);

  if (isFollowing) {
    // UNFOLLOW LOGIC
    currentUser.following = currentUser.following.filter(
      (id) => !id.equals(userToFollow._id)
    );
    userToFollow.followers = userToFollow.followers.filter(
      (id) => !id.equals(currentUser._id)
    );

    await Promise.all([currentUser.save(), userToFollow.save()]);

    return res.status(200).json({
      status: "success",
      message: `You unfollowed ${userToFollow.username}`,
      following: false,
    });
  } else {
    // FOLLOW LOGIC
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    // CREATE NOTIFICATION
    await Notification.create({
      sender: currentUser._id,
      recipient: userToFollow._id,
      type: "follow",
      message: `${currentUser.username} started following you.`,
    });

    await Promise.all([currentUser.save(), userToFollow.save()]);

    return res.status(200).json({
      status: "success",
      message: `You are following ${userToFollow.username}`,
      following: true,
    });
  }
});

export const getSuggestedUsers = catchAsync(async (req, res, next) => {
  const currentUserId = req.user._id;

  // Get the logged-in user
  const currentUser = await User.findById(currentUserId);

  // Exclude current user + already-followed users
  const excludedUsers = [currentUserId, ...currentUser.following];

  // Find other users that are not in excludedUsers
  const suggestedUsers = await User.find({
    _id: { $nin: excludedUsers },
  })
    .select("username name profileImage bio") // select only what’s needed
    .limit(5); // you can adjust this (e.g., show top 5 suggestions)

  res.status(200).json({
    status: "success",
    results: suggestedUsers.length,
    data: suggestedUsers,
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const { name, userName, bio, email, profileImage, coverImage } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found.", 404));

  // ✅ Basic info updates
  if (name) user.name = name;
  if (bio) user.bio = bio;
  if (email) user.email = email;
  if (userName) user.username = userName;

  // ✅ Upload new profile image if provided
  if (profileImage) {
    if (user.profileImagePublicId) {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
    }

    const uploadResponse = await cloudinary.uploader.upload(profileImage, {
      folder: "twitter-clone/users/profile-images",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    user.profileImage = uploadResponse.secure_url;
    user.profileImagePublicId = uploadResponse.public_id;
  }

  // ✅ Upload new cover image if provided
  if (coverImage) {
    if (user.coverImagePublicId) {
      await cloudinary.uploader.destroy(user.coverImagePublicId);
    }

    const uploadResponse = await cloudinary.uploader.upload(coverImage, {
      folder: "twitter-clone/users/cover-images",
      transformation: [{ width: 1500, height: 500, crop: "limit" }],
    });

    user.coverImage = uploadResponse.secure_url;
    user.coverImagePublicId = uploadResponse.public_id;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully.",
    data: {
      user,
    },
  });
});
