import { body } from "express-validator";

export const updatePasswordValidator = [
  body("oldPassword").notEmpty().withMessage("Old password is required."),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("New password must contain at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("New password must contain at least one number.")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("New password must contain at least one special character."),
];
