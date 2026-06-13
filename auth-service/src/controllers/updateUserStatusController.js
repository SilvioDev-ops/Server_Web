import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const updateUserStatusController = async (userId, isActive) => {
  const User = getUserModel();

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: isActive },
      { new: true }
    );

    if (!updatedUser) {
      logger.warn("Attempted to update status for non-existent user", {
        userId,
        isActive,
      });
      throw new Error("User not found.");
    }

    if (isActive === false) {
      updatedUser.refreshToken = undefined;
      updatedUser.refreshTokenExpiresAt = undefined;
      await updatedUser.save();
      logger.audit(`User ${userId} deactivated and refresh token cleared.`, {
        userId: updatedUser._id,
        email: updatedUser.email,
        status: "inactive",
      });
      logger.info(`User ${userId} deactivated and refresh token cleared.`, {
        userId: updatedUser._id,
      });
    } else {
      logger.audit(`User ${userId} activated.`, {
        userId: updatedUser._id,
        email: updatedUser.email,
        status: "active",
      });
      logger.info(`User ${userId} activated.`, { userId: updatedUser._id });
    }

    return updatedUser;
  } catch (error) {
    logger.error("Error in updateUserStatusController", {
      message: error.message,
      stack: error.stack,
      userId,
      isActive,
    });
    throw error;
  }
};
