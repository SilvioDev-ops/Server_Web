import { validationResult } from "express-validator";
import { localLoginController } from "../controllers/localLoginController.js";
import logger from "../utils/logger.js";

export const localLoginHandler = async (req, res) => {
  const ipAddress = req.ip;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Login request failed validation", {
      errors: errors.array(),
      ipAddress,
    });
    return res.status(400).json({ message: "Invalid credentials." });
  }

  try {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await localLoginController(
      email,
      password,
      ipAddress
    );

    res.status(200).json({ user, accessToken, refreshToken });
    logger.info("Login request successfully handled", {
      userId: user._id,
      email: user.email,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error during login in localLoginHandler:", {
      message: error.message,
      stack: error.stack,
      email: req.body.email,
      ipAddress,
    });
    if (
      error.message.includes("Invalid credentials") ||
      error.message.includes("Please verify your email")
    ) {
      return res.status(401).json({ message: error.message });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
};
