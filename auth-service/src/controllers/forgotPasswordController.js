import { getUserModel } from "../getModel.js";
import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;
const FRONTEND_RESET_PASSWORD_URL = process.env.FRONTEND_RESET_PASSWORD_URL;

export const forgotPasswordController = async (email) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Attempted password reset for non-existent email`, { email });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = Date.now() + 3600000;

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(resetTokenExpires);
    await user.save();

    const resetLink = `${FRONTEND_RESET_PASSWORD_URL}?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    const emailSubject = "Restablecimiento de Contraseña para tu cuenta";
    const emailText = `
¡Hola ${user.firstName || ""}!

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Haz clic en el siguiente enlace para establecer una nueva contraseña:
${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste esto, por favor, ignora este correo. Tu contraseña actual permanecerá sin cambios.

Saludos,
El equipo de [Nombre de tu Aplicación]
`;
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
  .header { background-color: #f8f8f8; padding: 10px 0; text-align: center; border-bottom: 1px solid #eee; }
  .content { padding: 20px; }
  .button {
    display: inline-block;
    padding: 10px 20px;
    margin: 15px 0;
    background-color: #007bff;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 5px;
  }
  .footer { text-align: center; font-size: 0.9em; color: #777; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Restablecimiento de Contraseña</h2>
    </div>
    <div class="content">
      <p>¡Hola ${user.firstName || ""}!</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
      <p>Haz clic en el siguiente botón para establecer una nueva contraseña:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Restablecer mi Contraseña</a>
      </p>
      <p>Este enlace es válido por <b>1 hora</b>.</p>
      <p>Si no solicitaste este restablecimiento, por favor, ignora este correo. Tu contraseña actual permanecerá sin cambios.</p>
      <br>
      <p>Saludos,</p>
      <p>El equipo de [Nombre de tu Aplicación]</p>
    </div>
    <div class="footer">
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
`;
    const fullNotificationServiceUrl = `${NOTIFICATION_SERVICE_URL}`;

    await axios.post(fullNotificationServiceUrl, {
      to: user.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    logger.audit(`Password reset email sent successfully`, {
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    logger.error("Error in forgotPasswordController", {
      message: error.message,
      stack: error.stack,
      email,
    });
    throw new Error("Failed to process password reset request.");
  }
};
