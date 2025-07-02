import { getUserModel } from "../getModel.js";

export const verifyEmailController = async (token) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({
      verificationToken: token,
      isVerified: false,
    });

    if (!user) {
      throw new Error(
        "Verification token is invalid or has already been used."
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    return { message: "Email verified successfully." };
  } catch (error) {
    console.error("Error in verifyEmailController:", error);
    throw error;
  }
};
