<<<<<<< HEAD
import mongoose from "mongoose";
import dotenv from "dotenv";

async function connectDB() {
  dotenv.config();
=======
// import mongoose from "mongoose";
// import dotenv from "dotenv";

// async function connectDB() {
//   dotenv.config();
//   const mongoURI = process.env.MONGO_URI_AUTH;

//   try {
//     const connection = await mongoose.connect(mongoURI);
//     console.log(
//       "MongoDB (Auth Service) conected to:",
//       connection.connection.host,
//       connection.connection.port,
//       connection.connection.name
//     );
//     return connection.connection;
//   } catch (error) {
//     console.error("MongoDB connection error (Auth Service):", error);
//     throw error;
//   }
// }

// export default connectDB;

//Conexion para Vercel
import mongoose from "mongoose";

async function connectDB() {
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
  const mongoURI = process.env.MONGO_URI_AUTH;

  try {
    const connection = await mongoose.connect(mongoURI, {
<<<<<<< HEAD
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      "MongoDB (Auth Service) conected to:",
=======
      serverSelectionTimeoutMS: 30000,
    });
    console.log(
      "MongoDB (Auth Service) connected to:",
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
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
