import { validationResult } from "express-validator";
import { putUserProfileController } from "../controllers/putUserProfileController.js";

export const putUserProfileHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.params;
  const userData = req.body;

  try {
    const updatedProfile = await putUserProfileController(userId, userData);
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error(
      "Error al actualizar perfil de usuario en el handler:",
      error
    );
    res.status(500).json({
      message: "Error al actualizar perfil de usuario",
      error: error.message,
    });
  }
};
