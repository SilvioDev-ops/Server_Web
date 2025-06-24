import { validationResult } from "express-validator";
import postUserController from "../controllers/postUserController.js";

export const postUserHandler = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    await postUserController(req, res);
  } catch (error) {
    console.error("error in the registration handle:", error);
    res
      .status(500)
      .json({ error: "Hubo un problema al procesar el registro." });
  }
};
