// api/index.js
import app from "../app.js";
import connectDB from "../src/config/database.js";
import dotenv from "dotenv";
dotenv.config();

let isDbConnected = false;

async function ensureDbConnection() {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
      console.log("Database connection established for serverless function.");
    } catch (error) {
      console.error(
        "Failed to connect to database in serverless function:",
        error
      );
    }
  }
}

ensureDbConnection();

export default app;
