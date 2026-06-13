import { validationResult } from "express-validator";
import { forgotPasswordController } from "../controllers/forgotPasswordController.js";
import logger from "../utils/logger.js";

export const forgotPasswordHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Forgot password request failed validation", {
      errors: errors.array(),
      ipAddress: req.ip,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  const ipAddress = req.ip;

  try {
    await forgotPasswordController(email);

    res.status(200).json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
    logger.info("Password reset request processed", { email, ipAddress });
  } catch (error) {
    logger.error("Error in forgotPasswordHandler:", {
      message: error.message,
      stack: error.stack,
      email,
      ipAddress,
    });
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error during password reset request.",
        error: error.message,
      });
    }
  }
};
