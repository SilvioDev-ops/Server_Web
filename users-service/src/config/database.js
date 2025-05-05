import mongoose from "mongoose";
import dotenv from "dotenv";

async function connectDB() {
  dotenv.config();
  const mongoURI = process.env.MONGO_URI_USERS;
  console.log("Users Service intentando conectar a:", mongoURI);

  try {
    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      "MongoDB (Users Service) conectado a:",
      connection.connection.host,
      connection.connection.port,
      connection.connection.name
    );
    return connection.connection;
  } catch (error) {
    console.error("Error de conexión a MongoDB (Users Service):", error);
    throw error;
  }
}

export default connectDB;
