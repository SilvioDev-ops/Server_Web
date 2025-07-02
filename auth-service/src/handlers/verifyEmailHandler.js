import { validationResult } from "express-validator";
import { query } from "express-validator";
import { verifyEmailController } from "../controllers/verifyEmailController.js";

export const verifyEmailValidation = [
  query("token")
    .notEmpty()
    .withMessage("Verification token is required.")
    .isString()
    .withMessage("Verification token must be a string."),
];

export const verifyEmailHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.query;

  try {
    const result = await verifyEmailController(token);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in verifyEmailHandler:", error);

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
