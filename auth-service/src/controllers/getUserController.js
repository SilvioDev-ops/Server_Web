import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const getUserController = async (userId) => {
  const User = getUserModel();
  try {
    const user = await User.findById(userId).select(
      "-password -verificationToken -resetPasswordToken -refreshToken -refreshTokenExpiresAt"
    );
    if (!user) {
      logger.warn("Attempted to get non-existent user", { userId });
      throw new Error("Usuario no encontrado");
    }

    const userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    logger.info("User data fetched successfully", {
      userId: user._id,
      email: user.email,
    });
    return userData;
  } catch (error) {
    logger.error("Error al obtener usuario en getUserController", {
      message: error.message,
      stack: error.stack,
      userId,
    });
    throw error;
  }
};
