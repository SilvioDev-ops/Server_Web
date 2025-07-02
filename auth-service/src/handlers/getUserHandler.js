// auth-service/src/handlers/getUserHandler.js
import { getUserController } from "../controllers/getUserController.js";
import logger from "../utils/logger.js";

export const getUserHandler = async (req, res) => {
  const userIdFromParams = req.params.userId;
  const authenticatedUserId = req.user ? req.user._id : "N/A";
  const ipAddress = req.ip;

  try {
    const userData = await getUserController(userIdFromParams);

    res.status(200).json(userData);
    logger.info("User data retrieved successfully by handler", {
      requestedUserId: userIdFromParams,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
  } catch (error) {
    if (error.message === "Usuario no encontrado") {
      logger.warn("Attempted to retrieve non-existent user in handler", {
        requestedUserId: userIdFromParams,
        authenticatedBy: authenticatedUserId,
        ipAddress,
        message: error.message,
      });
      return res.status(404).json({ message: error.message });
    }

    logger.error("Error in getUserHandler:", {
      message: error.message,
      stack: error.stack,
      requestedUserId: userIdFromParams,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    if (!res.headersSent) {
      res.status(500).json({
        message: "Error al obtener usuario",
        error: error.message,
      });
    }
  }
};
