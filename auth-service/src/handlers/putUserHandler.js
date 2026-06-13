import { validationResult } from "express-validator";
import { putUserController } from "../controllers/putUserController.js";
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";
import logger from "../utils/logger.js";

export const putUserHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";
  const { userId } = req.params;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Password update request failed validation", {
      errors: errors.array(),
      userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  const { oldPassword, newPassword } = req.body;

  try {
    const User = getUserModel();
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      logger.warn("Attempted to update password for non-existent user", {
        userId,
        authenticatedBy: authenticatedUserId,
        ipAddress,
      });
      return res.status(404).json({ message: "User not found." });
    }

    if (authenticatedUserId !== userId && !req.user.roles.includes("Admin")) {
      logger.warn("Unauthorized attempt to update another user's password", {
        userId,
        authenticatedBy: authenticatedUserId,
        ipAddress,
      });
      return res.status(403).json({
        message:
          "Forbidden: You can only update your own password or must be an Admin.",
      });
    }

    const isMatch = await handlePassword.compare(
      oldPassword,
      userToUpdate.password
    );

    if (!isMatch) {
      logger.warn("Password update attempt with invalid old password", {
        userId,
        authenticatedBy: authenticatedUserId,
        ipAddress,
      });
      return res.status(400).json({ message: "Invalid old password." });
    }

    const hashedNewPassword = await handlePassword.encrypt(newPassword);

    const userDataToUpdate = { password: hashedNewPassword };

    const updatedUser = await putUserController(userId, userDataToUpdate);

    res.status(200).json({ message: "Password updated successfully." });
    logger.audit("User password updated successfully", {
      userId,
      email: userToUpdate.email,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    logger.info("Password update request successfully handled", {
      userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error updating user password in handler:", {
      message: error.message,
      stack: error.stack,
      userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
};
