// users-service/src/handlers/uploadAvatarHandler.js
import multer from "multer";
import { uploadAvatarController } from "../controllers/uploadAvatarController.js";
import logger from "../utils/logger.js";
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
}).single("avatar");

export const uploadAvatarHandler = (req, res) => {
  const userId = req.params.userId;
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      logger.warn("Multer error during avatar upload", {
        userId,
        ipAddress,
        authenticatedBy: authenticatedUserId,
        message: err.message,
        code: err.code,
      });
      return res.status(400).json({ message: err.message });
    } else if (err) {
      logger.error("File upload error in uploadAvatarHandler", {
        userId,
        ipAddress,
        authenticatedBy: authenticatedUserId,
        message: err.message,
        stack: err.stack,
      });
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      logger.warn("No file provided for avatar upload", {
        userId,
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
      return res.status(400).json({ message: "No file provided." });
    }

    try {
      // El handler sigue pasando req.file.buffer, que ahora el controlador espera como imageBuffer
      const result = await uploadAvatarController(userId, req.file.buffer);

      res.status(200).json(result);
      logger.audit("User avatar uploaded successfully", {
        userId,
        authenticatedBy: authenticatedUserId,
        ipAddress,
        avatarUrl: result.avatarUrl,
      });
      logger.info("Avatar upload request successfully handled", {
        userId,
        authenticatedBy: authenticatedUserId,
        ipAddress,
      });
    } catch (error) {
      logger.error("Error in uploadAvatarHandler:", {
        message: error.message,
        stack: error.stack,
        userId,
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
      if (!res.headersSent) {
        res.status(500).json({
          message: "Internal server error during avatar upload.",
          error: error.message,
        });
      }
    }
  });
};
