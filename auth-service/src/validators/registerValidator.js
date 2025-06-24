import { body } from "express-validator";

export const registerValidator = [
  // Validate email
  body("email").isEmail().withMessage("Invalid email format.").normalizeEmail(),

  // Validate password
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character."),
  // Validación de firstName
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long."),
  // Validación de lastName
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long."),
];
