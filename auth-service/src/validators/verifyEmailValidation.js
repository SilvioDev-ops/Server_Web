import { query } from "express-validator";

export const verifyEmailValidation = [
  query("token")
    .notEmpty()
    .withMessage("Verification token is required.")
    .isString()
    .withMessage("Verification token must be a string."),
];
