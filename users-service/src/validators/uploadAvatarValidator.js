import { body } from "express-validator";

export const uploadAvatarValidator = [
  body("avatar")
    .notEmpty()
    .withMessage("Avatar is required")
    .bail()
    .isString()
    .withMessage("Avatar must be a string")
    .bail()
    .isLength({ max: 255 })
    .withMessage("Avatar must be at most 255 characters long"),
];
