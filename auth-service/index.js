// Auth-Service/index.js (asumiendo esta es la ruta correcta de tu archivo)

import app from "./src/app.js"; // Asegúrate de que esta ruta es correcta desde index.js
import connectDB from "./src/config/database.js";
import dotenv from "dotenv";

dotenv.config();

// Conectarse a la base de datos cuando se inicia la función serverless.
// Vercel maneja el ciclo de vida de la función, la conexión ocurrirá en "cold starts".
connectDB()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
    // En un entorno serverless, no querrías que el proceso termine abruptamente.
    // Simplemente loguea el error.
  });

// ¡ESTA ES LA LÍNEA CLAVE! Exporta tu aplicación Express.
// Vercel la tomará y la convertirá en una función serverless.
export default app;

// ELIMINA O COMENTA ESTO: Vercel maneja el "listen" por ti.
/*
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
*/
