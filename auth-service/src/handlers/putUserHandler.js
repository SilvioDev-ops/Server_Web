import { putUserController } from "../controllers/putUserController.js";

export const putUserHandler = async (req, res) => {
  try {
    const updatedUser = await putUserController(req.params.userId, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};
