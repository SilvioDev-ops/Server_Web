import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error(
      "Error al conectar con el servidor de correo (Nodemailer):",
      error
    );
  } else {
    console.log("Servidor de correo (Nodemailer) listo para enviar mensajes.");
  }
});

export default transporter;
