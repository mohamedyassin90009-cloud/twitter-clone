import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import AppError from "../utils/appError.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "twitter-clone/users", // folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new AppError("Only image files are allowed!", 400), false);
};

export const upload = multer({ storage, fileFilter });
