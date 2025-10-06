import catchAsync from "../util/catchAsync.js";
import AppError from "../util/appError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Generate JWT
const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRESIN,
  });

  // Send via cookie
  res.cookie("jwt", token, {
    httpOnly: true, // Prevents JS access (XSS protection)
    secure: process.env.NODE_ENV === "production", // Use HTTPS only in production
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
};

// Signup
export const signup = catchAsync(async (req, res, next) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password)
    return next(new AppError("All fields are required", 400));

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser)
    return next(new AppError("Email or username already exists", 400));

  const user = await User.create({ name, username, email, password });

  generateTokenAndSetCookie(res, user._id);

  res.status(201).json({
    status: "success",
    message: "Signup successfully!",
    user,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password)
    return next(new AppError("Email/Username and password are required", 400));

  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  }).select("+password");

  if (!user || !(await user.matchPassword(password, user.password)))
    return next(new AppError("Invalid credentials", 401));

  generateTokenAndSetCookie(res, user._id);

  res.status(200).json({
    status: "success",
    message: "login successfully",
    user,
  });
});

export const logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
