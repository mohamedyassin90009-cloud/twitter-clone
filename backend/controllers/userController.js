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

  const isFollowing = currentUser.following.some(
    (userId) => userId.toString() === userToFollow._id.toString()
  );

  if (isFollowing) {
    // ✅ UNFOLLOW
    currentUser.following = currentUser.following.filter(
      (userId) => userId.toString() !== userToFollow._id.toString()
    );
    userToFollow.followers = userToFollow.followers.filter(
      (followerId) => followerId.toString() !== currentUser._id.toString()
    );

    await Promise.all([
      currentUser.save({ validateBeforeSave: false }),
      userToFollow.save({ validateBeforeSave: false }),
    ]);

    return res.status(200).json({
      status: "success",
      message: `You unfollowed ${userToFollow.username}`,
      following: false,
    });
  } else {
    // ✅ FOLLOW
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await Notification.create({
      sender: currentUser._id,
      recipient: userToFollow._id,
      type: "follow",
      message: `${currentUser.username} started following you.`,
    });

    await Promise.all([
      currentUser.save({ validateBeforeSave: false }),
      userToFollow.save({ validateBeforeSave: false }),
    ]);

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

export const updateUser = catchAsync(async (req, res) => {
  const { fullName, email, username, bio, link } = req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  let user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (profileImg) {
    if (user.profileImg) {
      // https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
      await cloudinary.uploader.destroy(
        user.profileImg.split("/").pop().split(".")[0]
      );
    }

    const uploadedResponse = await cloudinary.uploader.upload(profileImg);
    profileImg = uploadedResponse.secure_url;
  }

  if (coverImg) {
    if (user.coverImg) {
      await cloudinary.uploader.destroy(
        user.coverImg.split("/").pop().split(".")[0]
      );
    }

    const uploadedResponse = await cloudinary.uploader.upload(coverImg);
    coverImg = uploadedResponse.secure_url;
  }

  user.fullName = fullName || user.fullName;
  user.email = email || user.email;
  user.username = username || user.username;
  user.bio = bio || user.bio;
  user.link = link || user.link;
  user.profileImg = profileImg || user.profileImg;
  user.coverImg = coverImg || user.coverImg;

  user = await user.save();

  return res.status(200).json(user);
});
