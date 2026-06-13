import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";
export const putUserController = async (userId, userData) => {
  const User = getUserModel();
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      logger.warn(
        "Attempted to update non-existent user in putUserController",
        { userId, userData }
      );
      throw new Error("User not found.");
    }

    logger.info("User updated successfully in putUserController", {
      userId: updatedUser._id,
      email: updatedUser.email,
      updatedFields: Object.keys(userData),
    });
    return updatedUser;
  } catch (error) {
    logger.error("Error updating user in controller:", {
      message: error.message,
      stack: error.stack,
      userId,
      userData,
    });
    throw error;
  }
};
