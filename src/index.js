import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/connection.js";
import { app } from "./app.js"; // Import the app from app.js

dotenv.config({
    path: './.env'
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("Err in connecting to db", err);
    });