import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";
export const postUserProfileController = async (userData) => {
  const UserProfile = getUserModel();

  logger.debug("Attempting to create new user profile", {
    email: userData.email,
    userId: userData.userId,
  });

  try {
    const newProfile = new UserProfile(userData);
    const savedProfile = await newProfile.save();

    logger.audit("User profile created successfully", {
      userId: savedProfile.userId,
      email: savedProfile.email,
    });
    logger.info("New user profile saved to database", {
      userId: savedProfile.userId,
      email: savedProfile.email,
    });

    return savedProfile;
  } catch (error) {
    logger.error("Error creating user profile in postUserProfileController:", {
      message: error.message,
      stack: error.stack,
      userData,
    });
    throw error;
  }
};
