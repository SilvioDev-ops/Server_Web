// auth-service/src/handlers/localLoginHandler.js
import { validationResult } from "express-validator";
import { localLoginController } from "../controllers/localLoginController.js";

export const localLoginHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid credentials." });
  }

  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await localLoginController(
      email,
      password
    );

    res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {
    console.error("Error during login:", error);
    if (
      error.message.includes("Invalid credentials") ||
      error.message.includes("Please verify your email")
    ) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error." });
  }
};
