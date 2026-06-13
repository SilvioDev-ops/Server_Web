import { body } from "express-validator";

export const putUserProfileValidator = [
  body("firstName")
    .optional()
    .isString()
    .withMessage("First name must be a string.")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters long."),

  body("lastName")
    .optional()
    .isString()
    .withMessage("Last name must be a string.")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters long."),

  body("phone")
    .optional()
    .isString()
    .withMessage("Phone number must be a string.")
    .trim()
    .isMobilePhone("any")
    .withMessage("Invalid phone number format."),

  body("address")
    .optional()
    .isObject()
    .withMessage("Address must be an object."),
  body("address.street")
    .optional()
    .isString()
    .withMessage("Street must be a string.")
    .trim()
    .notEmpty()
    .withMessage("Street cannot be empty."),
  body("address.city")
    .optional()
    .isString()
    .withMessage("City must be a string.")
    .trim()
    .notEmpty()
    .withMessage("City cannot be empty."),
  body("address.state")
    .optional()
    .isString()
    .withMessage("State must be a string.")
    .trim()
    .notEmpty()
    .withMessage("State cannot be empty."),
  body("address.zipCode")
    .optional()
    .isString()
    .withMessage("Zip code must be a string.")
    .trim()
    .notEmpty()
    .withMessage("Zip code cannot be empty.")
    .isLength({ min: 3, max: 10 })
    .withMessage("Zip code must be between 3 and 10 characters."),
  body("avatar")
    .optional()
    .isURL()
    .withMessage("Avatar must be a valid URL.")
    .trim(),
];
