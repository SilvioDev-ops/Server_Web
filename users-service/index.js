import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });

//Production
// import app from "./src/app.js";
// import connectDB from "./src/config/database.js";
// import dotenv from "dotenv";

// dotenv.config();

// connectDB()
//   .then(() => {
//     console.log("Database connected successfully.");
//   })
//   .catch((error) => {
//     console.error("Error connecting to the database:", error);
//   });

// export default app;
