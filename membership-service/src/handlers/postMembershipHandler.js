import { postMembershipController } from "../controllers/postMembershipController.js";
import logger from "../utils/logger.js";
export const postMembershipHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  logger.debug("HANDLER: Recibiendo solicitud para crear membresía...", {
    ipAddress,
    authenticatedBy: authenticatedUserId,
    body: req.body,
  });

  try {
    await postMembershipController(req, res, ipAddress, authenticatedUserId);
    logger.info(
      "HANDLER: Proceso de creación de membresía finalizado. (Respuesta enviada por el controlador)",
      { ipAddress, authenticatedBy: authenticatedUserId }
    );
  } catch (error) {
    logger.error(
      "HANDLER: Error en la creación de la membresía (capturado en handler):",
      {
        message: error.message,
        stack: error.stack,
        ipAddress,
        authenticatedBy: authenticatedUserId,
        body: req.body,
      }
    );

    if (!res.headersSent) {
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: error.message, errors: error.errors });
      }
      if (
        error.message.includes("Missing required fields") ||
        error.message.includes("Price cannot be negative") ||
        error.message.includes("Duration value must be at least 1") ||
        error.message.includes("Invalid duration unit") ||
        error.message.includes("Membership plan not found") ||
        error.message.includes("User not authenticated") ||
        error.message.includes("User already has an active subscription") ||
        error.message.includes(
          "Selected membership plan is not available or has been deleted."
        )
      ) {
        return res.status(400).json({ message: error.message });
      }
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
};
