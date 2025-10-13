import catchAsync from "../util/catchAsync.js";
import AppError from "../util/appError.js";
import Notification from "../models/notificationModel.js";

export const getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const notifications = await Notification.find({ recipient: userId })
    .populate({
      path: "sender",
      select: "username avatar",
    })
    .sort({ createdAt: -1 });

  await Notification.updateMany({ recipient: userId }, { read: true });

  res.status(200).json({
    status: "success",
    results: notifications.length,
    notifications,
  });
});

export const deleteNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  await Notification.deleteMany({ recipient: userId });

  res.status(200).json({
    message: "Notification deleted successfully.",
  });
});
