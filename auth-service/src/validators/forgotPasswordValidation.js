import { body } from "express-validator";

export const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),
];
