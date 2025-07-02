// auth-service/src/handlers/refreshTokenHandler.js
import { validationResult } from "express-validator";
import { refreshTokenController } from "../controllers/refreshTokenController.js";

export const refreshTokenHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { refreshToken } = req.body;

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await refreshTokenController(refreshToken);

    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Error in refreshTokenHandler:", error);

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
