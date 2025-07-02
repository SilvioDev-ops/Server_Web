// auth-service/src/controllers/postUserController.js
import axios from "axios";
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";
import { tokenSign } from "../middlewares/handleJsonWebToken.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3003";
const FRONTEND_VERIFY_EMAIL_URL =
  process.env.FRONTEND_VERIFY_EMAIL_URL || "http://localhost:5173/verify-email";
const MAIL_ADMIN = process.env.MAIL_ADMIN;

const createUserProfile = async (profileData) => {
  try {
    const usersServiceApiUrl = process.env.USERS_SERVICE_API_URL;
    const response = await axios.post(usersServiceApiUrl, profileData);
    console.log("User profile created in users-service:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error calling users-service API:", error.message);
    throw error;
  }
};

const rollbackUserCreation = async (userId) => {
  const User = getUserModel();
  try {
    await User.deleteOne({ _id: userId });
    console.log("User deleted successfully due to rollback.");
  } catch (rollbackError) {
    console.error("Rollback failed:", rollbackError);
    throw rollbackError;
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  console.log(`DEBUG: NOTIFICATION_SERVICE_URL: ${NOTIFICATION_SERVICE_URL}`);
  console.log(`DEBUG: FRONTEND_VERIFY_EMAIL_URL: ${FRONTEND_VERIFY_EMAIL_URL}`);

  const verifyLink = `${FRONTEND_VERIFY_EMAIL_URL}?token=${verificationToken}&email=${encodeURIComponent(
    email
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
        background-color: #28a745; /* Un verde para verificar */
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
          <p>Gracias por registrarte. Por favor, haz clic en el siguiente botón para verificar tu dirección de correo electrónico:</p>
          <p style="text-align: center;">
            <a href="${verifyLink}" class="button">Verificar mi Email</a>
          </p>
          <p>Si no te registraste en nuestra aplicación, por favor, ignora este correo.</p>
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

  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}`, {
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });
    console.log(`Verification email sent to: ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email.");
  }
};

const postUserController = async (req, res) => {
  const User = getUserModel();
  const { email, password, firstName, lastName, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const hashedPassword = await handlePassword.encrypt(password);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const userRole = email === MAIL_ADMIN ? "Admin" : defaultRole;

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      roles: [userRole],
      verificationToken: verificationToken,
      isVerified: false,
    });

    await newUser.save();

    const token = await tokenSign(newUser);

    const profileData = {
      userId: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: phone,
    };

    try {
      await createUserProfile(profileData);
    } catch (profileError) {
      console.error(
        "Error creating user profile in users-service, initiating rollback:",
        profileError
      );
      await rollbackUserCreation(newUser._id);
      return res.status(500).json({
        message: "Error creating user profile. User creation rolled back.",
        error: profileError.message,
      });
    }

    try {
      await sendVerificationEmail(newUser.email, verificationToken);
    } catch (emailError) {
      console.error(
        "Error sending verification email, but user created:",
        emailError
      );
    }

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Error creating user in postUserController:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error during user registration.",
        error: error.message,
      });
    }
  }
};

export default postUserController;
