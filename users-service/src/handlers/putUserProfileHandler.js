import { putUserProfileController } from "../controllers/putUserProfileController.js";
export const putUserProfileHandler = async (req, res) => {
  try {
    const updatedProfile = await putUserProfileController(
      req.params.userId,
      req.body
    );
    if (!updatedProfile) {
      return res
        .status(404)
        .json({ message: "Perfil de usuario no encontrado" });
    }
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error al actualizar perfil de usuario:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};
