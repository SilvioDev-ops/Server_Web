import { getAllUsersProfileController } from "../controllers/getAllUsersProfileController.js";

export const getAllUsersProfileHandler = async (req, res) => {
  try {
    const userProfiles = await getAllUsersProfileController();
    res.status(200).json(userProfiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profiles" });
  }
};
