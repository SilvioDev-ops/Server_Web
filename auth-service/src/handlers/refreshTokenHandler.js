import { validationResult } from "express-validator";
import { refreshTokenController } from "../controllers/refreshTokenController.js";
import logger from "../utils/logger.js";

export const refreshTokenHandler = async (req, res) => {
  const ipAddress = req.ip;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Refresh token request failed validation", {
      errors: errors.array(),
      ipAddress,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { refreshToken } = req.body;

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshTokenController(refreshToken);

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    logger.info("Refresh token request successfully handled", { ipAddress });
  } catch (error) {
    logger.error("Error in refreshTokenHandler:", {
      message: error.message,
      stack: error.stack,
      ipAddress,
    });
    if (error.message === "Invalid or expired refresh token.") {
      return res.status(401).json({ message: error.message });
    }

    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error during token refresh.",
        error: error.message,
      });
    }
  }
};
