import { deleteUserProfileController } from "../controllers/deleteUserProfileController.js";

export const deleteUserProfileHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedUserProfile = await deleteUserProfileController(userId);
    res.status(200).json(deletedUserProfile);
  } catch (error) {
    res.status(500).json({ message: "Error deleting user profile" });
  }
};
