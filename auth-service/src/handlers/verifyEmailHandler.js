import { validationResult } from "express-validator";
import { verifyEmailController } from "../controllers/verifyEmailController.js";
import logger from "../utils/logger.js";
export const verifyEmailHandler = async (req, res) => {
  const ipAddress = req.ip;
  const { token } = req.query;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Email verification request failed validation", {
      errors: errors.array(),
      ipAddress,
      token,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await verifyEmailController(token);

    res.status(200).json(result);
    logger.info("Email verification request successfully handled", {
      token,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error in verifyEmailHandler:", {
      message: error.message,
      stack: error.stack,
      token,
      ipAddress,
    });
    if (
      error.message ===
      "Verification token is invalid or has already been used."
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error during email verification.",
        error: error.message,
      });
    }
  }
};
