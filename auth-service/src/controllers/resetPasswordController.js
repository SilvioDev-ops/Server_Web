// auth-service/src/controllers/resetPasswordController.js
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";
import logger from "../utils/logger.js";

export const resetPasswordController = async (token, newPassword) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn("Password reset attempt with invalid or expired token", {
        token,
      });
      throw new Error("Password reset token is invalid or has expired.");
    }

    const hashedPassword = await handlePassword.encrypt(newPassword);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    logger.audit("User password reset successfully", {
      userId: user._id,
      email: user.email,
    });
    logger.info("Password has been reset successfully for user", {
      userId: user._id,
      email: user.email,
    });

    return { message: "Password has been reset successfully." };
  } catch (error) {
    logger.error("Error in resetPasswordController", {
      message: error.message,
      stack: error.stack,
      token,
    });
    throw error;
  }
};
