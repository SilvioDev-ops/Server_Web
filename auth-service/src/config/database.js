import mongoose from "mongoose";
import dotenv from "dotenv";

async function connectDB() {
  dotenv.config();
  const mongoURI = process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default connectDB;
