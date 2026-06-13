import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const getAllUsersController = async () => {
  const User = getUserModel();

  try {
    const users = await User.find({}).select(
      "-password -verificationToken -resetPasswordToken -refreshToken -refreshTokenExpiresAt"
    );
    logger.info("All users fetched successfully for admin view");
    return users;
  } catch (error) {
    logger.error("Error in getAllUsersController", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
