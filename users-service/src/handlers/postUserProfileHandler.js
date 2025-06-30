import { validationResult } from "express-validator";
import { postUserProfileController } from "../controllers/postUserProfileController.js";

export const postUserProfileHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, email, firstName, lastName, phone } = req.body;
  const userData = {
    userId,
    email,
    firstName,
    lastName,
    phone,
  };

  try {
    const newProfile = await postUserProfileController(userData);
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ message: "Error creating user profile" });
  }
};
