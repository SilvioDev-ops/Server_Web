import { body } from "express-validator";

export const updateUserStatusValidator = [
  body("isActive")
    .isBoolean()
    .withMessage("isActive must be a boolean value.")
    .notEmpty()
    .withMessage("isActive is required."),
];
