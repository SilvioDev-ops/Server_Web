import { getAllUsersController } from "../controllers/getAllUsersController.js";
import logger from "../utils/logger.js";

export const getAllUsersHandler = async (req, res) => {
  const ipAddress = req.ip;
  const userId = req.user ? req.user._id : "N/A";

  try {
    const users = await getAllUsersController();

    res.status(200).json(users);
    logger.audit("Admin fetched all users successfully", { userId, ipAddress });
    logger.info("All users list sent to admin", {
      userId,
      ipAddress,
      userCount: users.length,
    });
  } catch (error) {
    logger.error("Error in getAllUsersHandler", {
      message: error.message,
      stack: error.stack,
      userId,
      ipAddress,
    });
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error while fetching users.",
        error: error.message,
      });
    }
  }
};
