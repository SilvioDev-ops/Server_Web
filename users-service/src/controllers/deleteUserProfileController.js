import { getUserModel } from "../getModel.js";

const UserProfile = getUserModel();

export const deleteUserProfileController = async (userId) => {
  try {
    const deletedUserProfile = await UserProfile.findByIdAndDelete(userId);
    if (!deletedUserProfile) {
      throw new Error("User profile not found");
    }
    return deletedUserProfile;
  } catch (error) {
    console.error("Error deleting user profile:", error);
    throw error;
  }
};
