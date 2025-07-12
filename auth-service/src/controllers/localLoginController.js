import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";
import { tokenSign } from "../middlewares/handleJsonWebToken.js";
import crypto from "crypto";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

export const localLoginController = async (email, password, ipAddress) => {
  const User = getUserModel();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Login attempt with non-existent email", {
        email,
        ipAddress,
      });
      throw new Error("Invalid credentials.");
    }

    if (!user.isVerified) {
      logger.warn("Login attempt for unverified email", {
        email,
        userId: user._id,
        ipAddress,
      });
      throw new Error("Please verify your email to log in.");
    }

    const isMatch = await handlePassword.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Login attempt with incorrect password", {
        email,
        userId: user._id,
        ipAddress,
      });
      throw new Error("Invalid credentials.");
    }

    const accessToken = await tokenSign(user);

    const refreshToken = crypto.randomBytes(64).toString("hex");
    const refreshTokenExpirationDays = parseInt(
      process.env.REFRESH_TOKEN_EXPIRATION_DAYS || "7",
      10
    );
    const refreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenExpirationDays * 24 * 60 * 60 * 1000
    );

    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    user.lastLogin = new Date();
    await user.save();

    logger.audit("User logged in successfully", {
      userId: user._id,
      email: user.email,
      roles: user.roles,
      ipAddress,
    });
    logger.info("User logged in and tokens issued", {
      userId: user._id,
      email: user.email,
      ipAddress,
    });

    return { user, accessToken, refreshToken };
  } catch (error) {
    logger.error("Error in localLoginController", {
      message: error.message,
      stack: error.stack,
      email,
      ipAddress,
    });
    throw error;
  }
};
