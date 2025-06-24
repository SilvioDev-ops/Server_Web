import { body } from "express-validator";

export const loginValidator = [
  // Validate email
  body("email").isEmail().withMessage("Invalid email format.").normalizeEmail(),

  // Validate password
  body("password").notEmpty().withMessage("Invalid email or password."),
];
