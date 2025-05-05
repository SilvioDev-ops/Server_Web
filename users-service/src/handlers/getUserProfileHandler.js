import { getUserProfileController } from "../controllers/getUserProfileController.js";

export const getUserProfileHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const userProfile = await getUserProfileController(userId);
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
};
