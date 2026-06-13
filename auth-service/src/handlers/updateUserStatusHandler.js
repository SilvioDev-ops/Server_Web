import { validationResult } from "express-validator";
import { updateUserStatusController } from "../controllers/updateUserStatusController.js";
import logger from "../utils/logger.js";

export const updateUserStatusHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("User status update request failed validation", {
      errors: errors.array(),
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.params;
  const { isActive } = req.body;

  try {
    const updatedUser = await updateUserStatusController(userId, isActive);

    res.status(200).json({
      message: `User status updated successfully. User is now ${
        updatedUser.isActive ? "active" : "inactive"
      }.`,
      user: updatedUser,
    });
    logger.audit(`User status updated successfully`, {
      targetUserId: userId,
      newStatus: isActive,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    logger.info(`User status update request successfully handled`, {
      targetUserId: userId,
      newStatus: isActive,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error in updateUserStatusHandler:", {
      message: error.message,
      stack: error.stack,
      targetUserId: userId,
      newStatus: isActive,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });

    if (error.message === "User not found.") {
      return res.status(404).json({ message: error.message });
    }

    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error during user status update.",
        error: error.message,
      });
    }
  }
};
