// users-service/src/handlers/deleteUserProfileHandler.js
import { deleteUserProfileController } from "../controllers/deleteUserProfileController.js";
import logger from "../utils/logger.js";

export const deleteUserProfileHandler = async (req, res) => {
  const userId = req.params.userId;
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  try {
    const result = await deleteUserProfileController(userId);

    res.status(200).json(result);
    logger.audit("User profile soft delete request handled", {
      targetUserId: userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    logger.info("User profile soft delete handler completed", {
      targetUserId: userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error in deleteUserProfileHandler:", {
      message: error.message,
      stack: error.stack,
      targetUserId: userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    if (!res.headersSent) {
      if (error.message === "User profile not found.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({
        message: "Internal server error during user profile soft deletion.",
        error: error.message,
      });
    }
  }
};
