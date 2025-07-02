// auth-service/src/controllers/localLoginController.js
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";
import { tokenSign } from "../middlewares/handleJsonWebToken.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const localLoginController = async (email, password) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials.");
    }

    if (!user.isVerified) {
      throw new Error("Please verify your email to log in.");
    }

    const isMatch = await handlePassword.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials.");
    }

    const accessToken = await tokenSign(user);

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const refreshTokenExpiresAt = new Date(
      Date.now() +
        (process.env.REFRESH_TOKEN_EXPIRATION_DAYS || 7) * 24 * 60 * 60 * 1000
    );

    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    user.lastLogin = new Date();
    await user.save();
    return { user, accessToken, refreshToken };
  } catch (error) {
    console.error("Error in localLoginController:", error);
    throw error;
  }
};
