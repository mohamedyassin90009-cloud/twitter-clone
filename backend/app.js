import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

//
import authRoute from "./routes/authRoutes.js";
import userRoute from "./routes/userRoutes.js";
import postRoute from "./routes/postRoutes.js";
import notificationRoute from "./routes/notificationRoutes.js";

import { globalErrorHandler } from "./middleware/globalErrorHandler.js";

const app = express();

// Middlewares
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/notifications", notificationRoute);

app.use(globalErrorHandler);

export default app;
