import postUserController from "../controllers/postUserController.js";

export const postUserHandler = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ error: "Todos los campos son requeridos." });
    }

    await postUserController(req, res);
  } catch (error) {
    console.error("error in the registration handle:", error);
    res
      .status(500)
      .json({ error: "Hubo un problema al procesar el registro." });
  }
};
