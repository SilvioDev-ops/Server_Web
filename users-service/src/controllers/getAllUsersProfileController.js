import { getUserModel } from "../getModel.js";

const UserProfile = getUserModel();

export const getAllUsersProfileController = async () => {
  try {
    const userProfiles = await UserProfile.find();
    if (!userProfiles) {
      throw new Error("No user profiles found");
    }
    return userProfiles;
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
};
