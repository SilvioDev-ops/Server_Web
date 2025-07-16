// import mongoose from "mongoose";
// import dotenv from "dotenv";

// async function connectDB() {
//   dotenv.config();
//   const mongoURI = process.env.MONGO_URI_AUTH;

//   try {
//     const connection = await mongoose.connect(mongoURI, {
//       timeoutMS: 30000,
//     });
//     console.log(
//       "MongoDB (Users Service) conectado a:",
//       connection.connection.host,
//       connection.connection.port,
//       connection.connection.name
//     );
//     return connection.connection;
//   } catch (error) {
//     console.error("Error de conexión a MongoDB (Users Service):", error);
//     throw error;
//   }
// }

// export default connectDB;

//Conexion para Vercel
import mongoose from "mongoose";

async function connectDB() {
  const mongoURI = process.env.MONGO_URI_AUTH;

  try {
    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(
      "MongoDB (Auth Service) connected to:",
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
