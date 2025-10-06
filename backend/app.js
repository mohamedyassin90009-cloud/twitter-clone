import express from "express";
import cookieParser from "cookie-parser";
//
import authRoute from "./routes/authRoute.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);

app.use(globalErrorHandler);

export default app;
