import { getUserModel } from "../getModel.js";
import { tokenSign } from "../middlewares/handleJsonWebToken.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const refreshTokenController = async (refreshToken) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({
      refreshToken: refreshToken,
      refreshTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid or expired refresh token.");
    }

    const newAccessToken = await tokenSign(user);

    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    const newRefreshTokenExpiresAt = new Date(
      Date.now() +
        (process.env.REFRESH_TOKEN_EXPIRATION_DAYS || 7) * 24 * 60 * 60 * 1000
    );

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = newRefreshTokenExpiresAt;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error("Error in refreshTokenController:", error);
    throw error;
  }
};
