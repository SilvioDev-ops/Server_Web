import { getUserModel } from "../getModel.js";
import { tokenSign } from "../middlewares/handleJsonWebToken.js";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
import crypto from "crypto";
dotenv.config();

export const refreshTokenController = async (refreshToken) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({
      refreshToken: refreshToken,
      refreshTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn("Refresh token attempt with invalid or expired token", {
        refreshToken,
      });
      throw new Error("Invalid or expired refresh token.");
    }

    const newAccessToken = await tokenSign(user);

    const newRefreshToken = crypto.randomBytes(64).toString("hex");
    const refreshTokenExpirationDays = parseInt(
      process.env.REFRESH_TOKEN_EXPIRATION_DAYS || "7",
      10
    );
    const newRefreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenExpirationDays * 24 * 60 * 60 * 1000
    );

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = newRefreshTokenExpiresAt;
    await user.save();

    logger.audit("Refresh token used successfully", {
      userId: user._id,
      email: user.email,
    });
    logger.info("Tokens refreshed successfully for user", {
      userId: user._id,
      email: user.email,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    logger.error("Error in refreshTokenController", {
      message: error.message,
      stack: error.stack,
      refreshToken,
    });
    throw error;
  }
};
