import transporter from "../config/nodemailerConfig.js";
import nodemailer from "nodemailer";

export const sendResetPasswordEmailController = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado: %s", info.messageId);
    if (
      process.env.NODE_ENV === "development" &&
      nodemailer.getTestMessageUrl(info)
    ) {
      console.log(
        "URL de previsualización (solo para test accounts como Ethereal): %s",
        nodemailer.getTestMessageUrl(info)
      );
    }
    return info;
  } catch (error) {
    console.error("Error en sendEmailCore al enviar email:", error);
    throw error;
  }
};
