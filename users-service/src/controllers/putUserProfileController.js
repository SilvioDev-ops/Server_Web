import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const putUserProfileController = async (userId, userData) => {
  const UserProfile = getUserModel();

  logger.debug("Attempting to update user profile", { userId, userData });

  try {
    const updatedProfile = await UserProfile.findByIdAndUpdate(
      userId,
      userData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      logger.warn("User profile not found for update", { userId, userData });
      throw new Error("Perfil de usuario no encontrado.");
    }

    logger.audit("User profile updated successfully", {
      userId: updatedProfile._id,
      email: updatedProfile.email,
      updatedFields: Object.keys(userData),
    });
    logger.info("User profile saved to database after update", {
      userId: updatedProfile._id,
      email: updatedProfile.email,
    });

    return updatedProfile;
  } catch (error) {
    logger.error(
      "Error al actualizar el perfil de usuario en el controlador:",
      { message: error.message, stack: error.stack, userId, userData }
    );
    throw error;
  }
};
