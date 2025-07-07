// users-service/src/handlers/getUserProfileHandler.js
import { getUserProfileController } from "../controllers/getUserProfileController.js";
import logger from "../utils/logger.js";

export const getUserProfileHandler = async (req, res) => {
  const userId = req.params.userId;
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  const includeDeleted = req.query.includeDeleted === "true";

  try {
    const userProfile = await getUserProfileController(userId, includeDeleted);

    res.status(200).json(userProfile);
    logger.info("User profile data retrieved successfully by handler", {
      requestedUserId: userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
      includeDeleted,
    });
  } catch (error) {
    if (error.message === "User profile not found.") {
      logger.warn(
        "Attempted to retrieve non-existent or deleted user profile in handler",
        {
          requestedUserId: userId,
          authenticatedBy: authenticatedUserId,
          ipAddress,
          includeDeleted,
          message: error.message,
        }
      );
      return res.status(404).json({ message: error.message });
    }

    logger.error("Error in getUserProfileHandler:", {
      message: error.message,
      stack: error.stack,
      requestedUserId: userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
      includeDeleted,
    });
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error al obtener perfil de usuario.",
        error: error.message,
      });
    }
  }
};
