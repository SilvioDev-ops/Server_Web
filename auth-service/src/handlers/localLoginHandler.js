import localLoginController from "../controllers/localLoginController.js";

export const localLoginHandler = async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await localLoginController(email, password);
    res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};
