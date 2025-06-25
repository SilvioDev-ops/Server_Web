import { validationResult } from "express-validator";
import { body } from "express-validator";
import { forgotPasswordController } from "../controllers/forgotPasswordController.js";

export const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
];

export const forgotPasswordHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    await forgotPasswordController(email);

    res.status(200).json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgotPasswordHandler:", error);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error during password reset request.",
        error: error.message,
      });
    }
  }
};
