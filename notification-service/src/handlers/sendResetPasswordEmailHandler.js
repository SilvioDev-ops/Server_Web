import { sendResetPasswordEmailController } from "../controllers/sendResetPasswordEmailController.js";

export const sendResetPasswordEmailHandler = async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      message:
        "Faltan campos obligatorios para el email (destinatario, asunto, texto o HTML).",
    });
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await sendResetPasswordEmailController(mailOptions);

    res.status(200).json({
      message: "Email enviado exitosamente",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error en sendEmailHandler:", error);
    res
      .status(500)
      .json({ message: "Error al enviar email", error: error.message });
  }
};
