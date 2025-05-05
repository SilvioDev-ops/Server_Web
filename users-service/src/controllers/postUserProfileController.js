import { getUserModel } from "../getModel.js";

const UserProfile = getUserModel();

export const postUserProfileController = async (userData) => {
  try {
    const newProfile = new UserProfile(userData);
    await newProfile.save();
    return newProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};
