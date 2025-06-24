import { postMembershipController } from "../controllers/postMembershipController.js";

export const postMembershipHandler = async (req, res) => {
  try {
    await postMembershipController(req, res);
  } catch (error) {

    console.error("HANDLER: Error en la creación de la membresía (capturado en handler):", error);
    if (!res.headersSent) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        if (error.message.includes("Missing required fields") ||
            error.message.includes("Price cannot be negative") ||
            error.message.includes("Duration value must be at least 1") ||
            error.message.includes("Invalid duration unit") ||
            error.message.includes("Membership Plan not found") || 
            error.message.includes("User not authenticated") ||
            error.message.includes("User already has an active subscription")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
};