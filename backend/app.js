import path from "path";
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
const __dirname = path.resolve();

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

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

app.use(globalErrorHandler);

export default app;
