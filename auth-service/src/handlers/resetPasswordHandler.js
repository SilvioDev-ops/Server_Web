import { validationResult } from "express-validator";
import { resetPasswordController } from "../controllers/resetPasswordController.js";
import logger from "../utils/logger.js";

export const resetPasswordHandler = async (req, res) => {
  const ipAddress = req.ip;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Password reset request failed validation", {
      errors: errors.array(),
      ipAddress,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  try {
    const result = await resetPasswordController(token, newPassword);

    res.status(200).json(result);
    logger.info("Password reset request successfully handled", {
      token,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error in resetPasswordHandler:", {
      message: error.message,
      stack: error.stack,
      token,
      ipAddress,
    });

    if (error.message === "Password reset token is invalid or has expired.") {
      return res.status(400).json({ message: error.message });
    }

    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error during password reset.",
        error: error.message,
      });
    }
  }
};
