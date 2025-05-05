import { getUserController } from "../controllers/getUserController.js";

export const getUserHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = await getUserController(userId); //

    res.status(200).json(userData);
  } catch (error) {
    res.status(error.message === "Usuario no encontrado" ? 404 : 500).json({
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};
