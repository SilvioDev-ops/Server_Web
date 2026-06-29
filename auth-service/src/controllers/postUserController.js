import axios from "axios";
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";
import { tokenSign } from "../middlewares/handleJsonWebToken.js";
import crypto from "crypto";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL;
const FRONTEND_VERIFY_EMAIL_URL = process.env.FRONTEND_VERIFY_EMAIL_URL;
const MAIL_ADMIN = process.env.MAIL_ADMIN;

const sendVerificationEmail = async (email, verificationToken) => {
  if (!NOTIFICATION_SERVICE_URL) {
    throw new Error("NOTIFICATION_SERVICE_URL is not defined");
  }

  if (!FRONTEND_VERIFY_EMAIL_URL) {
    throw new Error("FRONTEND_VERIFY_EMAIL_URL is not defined");
  }

  const verifyLink = `${FRONTEND_VERIFY_EMAIL_URL}?token=${verificationToken}&email=${encodeURIComponent(
    email,
  )}`;

  const emailSubject = "Verifica tu cuenta";

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
          background-color: #28a745;
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
          <h2>Verificación de Cuenta</h2>
        </div>
        <div class="content">
          <p>¡Hola!</p>
          <p>Gracias por registrarte. Por favor, hacé clic en el siguiente botón para verificar tu dirección de correo electrónico:</p>
          <p style="text-align: center;">
            <a href="${verifyLink}" class="button">Verificar mi Email</a>
          </p>
          <p>Si no te registraste en nuestra aplicación, ignorá este correo.</p>
          <br>
          <p>Saludos,</p>
          <p>El equipo de tu aplicación</p>
        </div>
        <div class="footer">
          <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(
    "Enviando email a notification-service:",
    NOTIFICATION_SERVICE_URL,
  );
  console.log("Email destino:", email);

  const response = await axios.post(NOTIFICATION_SERVICE_URL, {
    to: email,
    subject: emailSubject,
    html: emailHtml,
  });

  logger.info("Verification email sent", {
    email,
    notificationResponse: response.data,
  });

  return response.data;
};

const postUserController = async (req, res) => {
  const User = getUserModel();
  const defaultRole = "Client";

  const {
    email,
    password,
    firstName,
    lastName,
    nombre,
    apellido,
    phone,
    phoneNumber,
    telefono,
  } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const finalFirstName = firstName || nombre;
    const finalLastName = lastName || apellido;
    const finalPhone = phone || phoneNumber || telefono;

    if (!finalFirstName || !finalLastName) {
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (finalPhone && finalPhone.trim() !== "") {
      const existingUserByPhone = await User.findOne({ phone: finalPhone });

      if (existingUserByPhone) {
        logger.warn("User registration attempt with existing phone number", {
          phone: finalPhone,
        });

        return res.status(400).json({
          message: "Phone number already exists",
        });
      }
    }

    const usersServiceApiUrl = process.env.USERS_SERVICE_API_URL;

    if (!usersServiceApiUrl) {
      return res.status(500).json({
        message: "USERS_SERVICE_API_URL is not defined",
      });
    }

    const hashedPassword = await handlePassword.encrypt(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const userRole = normalizedEmail === MAIL_ADMIN ? "Admin" : defaultRole;

    const newUser = new User({
      email: normalizedEmail,
      password: hashedPassword,
      firstName: finalFirstName,
      lastName: finalLastName,
      phone: finalPhone,
      roles: [userRole],
      verificationToken,
      isVerified: false,
    });

    await newUser.save();

    try {
      const profileData = {
        userId: newUser._id.toString(),
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: finalPhone,
      };

      const profileResponse = await axios.post(usersServiceApiUrl, profileData);

      console.log(
        "User profile created in users-service:",
        profileResponse.data,
      );

      await sendVerificationEmail(newUser.email, verificationToken);

      const token = await tokenSign(newUser);

      return res.status(201).json({
        message: "User created successfully. Verification email sent.",
        user: newUser,
        token,
      });
    } catch (error) {
      console.error("Error after creating auth user:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Message:", error.message);

      await User.deleteOne({ _id: newUser._id });

      return res.status(500).json({
        message:
          "Error creating user or sending verification email. User creation rolled back.",
        error: error.response?.data || error.message,
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default postUserController;
