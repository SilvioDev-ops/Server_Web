import { validationResult } from "express-validator";
import { postUserProfileController } from "../controllers/postUserProfileController.js";
import logger from "../utils/logger.js";

export const postUserProfileHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation errors during user profile creation", {
      errors: errors.array(),
      ipAddress,
      authenticatedBy: authenticatedUserId,
      body: req.body,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, email, firstName, lastName, phone, address, avatar } =
    req.body;
  const userData = {
    userId,
    email,
    firstName,
    lastName,
    phone,
    address,
    avatar,
  };

  try {
    const newProfile = await postUserProfileController(userData);

    res.status(201).json(newProfile);
    logger.audit("User profile created successfully", {
      userId: newProfile.userId,
      email: newProfile.email,
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });
    logger.info("User profile creation request successfully handled", {
      userId: newProfile.userId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });
  } catch (error) {
    logger.error("Error in postUserProfileHandler:", {
      message: error.message,
      stack: error.stack,
      ipAddress,
      authenticatedBy: authenticatedUserId,
      body: req.body,
    });
    if (!res.headersSent) {
      if (error.message === "User profile already exists.") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({
        message: "Internal server error during user profile creation.",
        error: error.message,
      });
    }
  }
};
