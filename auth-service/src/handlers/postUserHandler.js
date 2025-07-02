import { validationResult } from "express-validator";
import postUserController from "../controllers/postUserController.js";
import logger from "../utils/logger.js";

export const postUserHandler = async (req, res) => {
  const ipAddress = req.ip;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("User registration request failed validation", {
        errors: errors.array(),
        ipAddress,
      });
      return res.status(400).json({ errors: errors.array() });
    }

    await postUserController(req, res);
  } catch (error) {
    logger.error("Error in postUserHandler during registration:", {
      message: error.message,
      stack: error.stack,
      email: req.body.email,
      ipAddress,
    });

    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Hubo un problema al procesar el registro." });
    }
  }
};
