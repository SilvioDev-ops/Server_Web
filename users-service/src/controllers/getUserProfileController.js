import { getUserModel } from "../getModel.js";

const UserProfile = getUserModel();

export const getUserProfileController = async (userId) => {
  try {
    const userProfile = await UserProfile.findById(userId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }
    return userProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
