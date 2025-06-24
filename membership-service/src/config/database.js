import mongoose from "mongoose";
import dotenv from "dotenv";

async function connectDB() {
  dotenv.config();
  const mongoURI = process.env.MONGO_URI_AUTH;

  try {
    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      "MongoDB (Auth Service) conected to:",
      connection.connection.host,
      connection.connection.port,
      connection.connection.name
    );
    return connection.connection;
  } catch (error) {
    console.error("MongoDB connection error (Auth Service):", error);
    throw error;
  }
}

export default connectDB;
