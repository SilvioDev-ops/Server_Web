import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const getUserProfileController = async (
  userId,
  includeDeleted = false
) => {
  const UserProfile = getUserModel();

  let query = { _id: userId };

  if (!includeDeleted) {
    query.$or = [{ isDeleted: false }, { isDeleted: { $exists: false } }];
  }

  logger.debug(
    `Attempting to fetch user profile for userId: ${userId}, includeDeleted: ${includeDeleted}`
  );

  try {
    const userProfile = await UserProfile.findOne(query).select("-__v");

    if (!userProfile) {
      logger.warn("User profile not found or is deleted", {
        userId,
        includeDeleted,
      });
      throw new Error("User profile not found.");
    }

    logger.info("User profile retrieved successfully", {
      userId: userProfile._id,
      email: userProfile.email,
      isDeleted: userProfile.isDeleted,
    });
    return userProfile;
  } catch (error) {
    logger.error("Error in getUserProfileController:", {
      message: error.message,
      stack: error.stack,
      userId,
      includeDeleted,
    });
    throw error;
  }
};
