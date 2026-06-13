import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";
export const deleteUserProfileController = async (userId) => {
  const UserProfile = getUserModel();

  try {
    const deletedProfile = await UserProfile.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedProfile) {
      logger.warn("Attempted soft delete for non-existent user profile", {
        userId,
      });
      throw new Error("User profile not found.");
    }

    logger.audit("User profile soft deleted successfully", {
      userId: deletedProfile._id,
      email: deletedProfile.email,
    });
    logger.info("User profile marked as deleted", {
      userId: deletedProfile._id,
    });

    return {
      message: "User profile soft deleted successfully.",
      profile: deletedProfile,
    };
  } catch (error) {
    logger.error("Error in deleteUserProfileController (soft delete):", {
      message: error.message,
      stack: error.stack,
      userId,
    });
    throw error;
  }
};
