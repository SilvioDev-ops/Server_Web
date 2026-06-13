import { validationResult } from "express-validator";
import { putUserProfileController } from "../controllers/putUserProfileController.js";
import logger from "../utils/logger.js";

export const putUserProfileHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Validation errors during user profile update", {
      errors: errors.array(),
      userId: req.params.userId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
      body: req.body,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.params;
  const userData = req.body;

  try {
    const updatedProfile = await putUserProfileController(userId, userData);

    res.status(200).json(updatedProfile);
    logger.audit("User profile updated successfully", {
      userId: updatedProfile._id,
      email: updatedProfile.email,
      ipAddress,
      authenticatedBy: authenticatedUserId,
      updatedFields: Object.keys(userData),
    });
    logger.info("User profile update request successfully handled", {
      userId: updatedProfile._id,
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });
  } catch (error) {
    logger.error("Error in putUserProfileHandler:", {
      message: error.message,
      stack: error.stack,
      userId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
      body: req.body,
    });
    if (!res.headersSent) {
      if (error.message === "User profile not found.") {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes("Error updating authentication user") ||
        error.message.includes("Error updating authentication password") ||
        error.message.includes("Error updating authentication email")
      ) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({
        message: "Error updating user profile.",
      });
    }
  }
};
