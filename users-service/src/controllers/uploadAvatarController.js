// users-service/src/controllers/uploadAvatarController.js
import cloudinary from "../config/cloudinaryConfig.js";
import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const uploadAvatarController = async (userId, imageBuffer) => {
  const UserProfile = getUserModel();

  logger.debug(`Attempting to upload avatar for user: ${userId}`);

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
            folder: `user-avatars/${userId}`,
            public_id: `avatar_${userId}_${Date.now()}`,
            transformation: [
              {
                width: 200,
                height: 200,
                crop: "fill",
                gravity: "face",
                radius: "max",
              },
              { quality: "auto:eco" },
            ],
          },
          (error, result) => {
            if (error) {
              logger.error("Cloudinary upload_stream error", {
                message: error.message,
                userId,
                errorDetails: error,
              });
              reject(
                new Error(
                  `Error uploading image to Cloudinary: ${error.message}`
                )
              );
            } else {
              logger.info(
                "Image uploaded to Cloudinary successfully via stream",
                { publicId: result.public_id, url: result.secure_url, userId }
              );
              resolve(result);
            }
          }
        )
        .end(imageBuffer);
    });

    const avatarUrl = uploadResult.secure_url;

    const updatedProfile = await UserProfile.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      logger.warn(
        "Attempted to upload avatar for non-existent user, profile not found",
        { userId }
      );
      throw new Error("User profile not found.");
    }

    logger.info("Avatar uploaded and user profile updated successfully", {
      userId,
      avatarUrl,
    });
    return { avatarUrl, message: "Avatar uploaded successfully." };
  } catch (error) {
    logger.error("Error uploading avatar in uploadAvatarController:", {
      message: error.message,
      stack: error.stack,
      userId,
    });
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }
};
