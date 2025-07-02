// auth-service/src/controllers/verifyEmailController.js
import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js"; // <-- Importa el logger

export const verifyEmailController = async (token) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({
      verificationToken: token,
      isVerified: false,
    });

    if (!user) {
      logger.warn(
        "Email verification attempt with invalid or already used token",
        { token }
      );
      throw new Error(
        "Verification token is invalid or has already been used."
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    logger.audit("User email verified successfully", {
      userId: user._id,
      email: user.email,
    });
    logger.info("Email verified successfully for user", {
      userId: user._id,
      email: user.email,
    });
    return { message: "Email verified successfully." };
  } catch (error) {
    logger.error("Error in verifyEmailController", {
      message: error.message,
      stack: error.stack,
      token,
    });
    throw error;
  }
};
