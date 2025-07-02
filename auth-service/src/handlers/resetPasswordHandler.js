// auth-service/src/handlers/resetPasswordHandler.js
import { validationResult } from "express-validator";
import { resetPasswordController } from "../controllers/resetPasswordController.js";

export const resetPasswordHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;

  try {
    const result = await resetPasswordController(token, newPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in resetPasswordHandler:", error);

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
