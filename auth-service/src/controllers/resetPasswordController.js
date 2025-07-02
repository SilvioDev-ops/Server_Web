// auth-service/src/controllers/resetPasswordController.js
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";

export const resetPasswordController = async (token, newPassword) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error("Password reset token is invalid or has expired.");
    }
    const hashedPassword = await handlePassword.encrypt(newPassword);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return { message: "Password has been reset successfully." };
  } catch (error) {
    console.error("Error in resetPasswordController:", error);
    throw error;
  }
};
