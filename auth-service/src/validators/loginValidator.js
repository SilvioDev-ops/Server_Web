import { body } from "express-validator";

export const loginValidator = [
  body("email").isEmail().withMessage("Invalid email format.").normalizeEmail(),

  body("password").notEmpty().withMessage("Invalid email or password."),
];
