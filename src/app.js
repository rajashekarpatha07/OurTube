import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/User.routes.js"; // Import the user routes

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes declaration
app.use("/api/v1/users", userRouter);

export { app };