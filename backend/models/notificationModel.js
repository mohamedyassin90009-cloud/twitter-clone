// models/notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Who receives the notification
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Who triggered the notification
    },
    type: {
      type: String,
      enum: ["follow", "like", "comment", "mention"], // Notification types
      required: true,
    },
    // post: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Post", // Optional, only for like/comment/mention notifications
    // },
    message: {
      type: String, // Optional custom message for flexibility
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
