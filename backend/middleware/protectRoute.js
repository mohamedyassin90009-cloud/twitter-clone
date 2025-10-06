import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/userModel.js";
import AppError from "../util/appError.js";
import catchAsync from "../util/catchAsync.js";

const protect = catchAsync(async (req, res, next) => {
  // Get token (supports both Bearer header and cookies)
  let token = req.cookies?.jwt;

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authorized. Please log in", 401));
  }

  // Verify token asynchronously (using promisify)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exists
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // Attach user to request
  req.user = user;

  next();
});

export default protect;
