import { getAllUsersProfileController } from "../controllers/getAllUsersProfileController.js";
import logger from "../utils/logger.js";

export const getAllUsersProfileHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  const { page, limit, sort, ...filters } = req.query;

  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;

  let parsedSort = {};
  if (sort) {
    const [sortBy, sortOrder] = sort.split(":");
    if (sortBy && (sortOrder === "asc" || sortOrder === "desc")) {
      parsedSort[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      logger.warn("Invalid sort parameter received", {
        sort,
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
    }
  } else {
    parsedSort = { createdAt: -1 };
  }

  try {
    const { userProfiles, pagination } = await getAllUsersProfileController(
      filters,
      parsedPage,
      parsedLimit,
      parsedSort
    );

    res.status(200).json({ userProfiles, pagination });
    logger.audit("Admin fetched user profiles with filters", {
      authenticatedBy: authenticatedUserId,
      ipAddress,
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort: parsedSort,
    });
    logger.info(
      "User profiles list sent to admin with filters and pagination",
      {
        authenticatedBy: authenticatedUserId,
        ipAddress,
        userCount: userProfiles.length,
        pagination,
      }
    );
  } catch (error) {
    logger.error("Error in getAllUsersProfileHandler:", {
      message: error.message,
      stack: error.stack,
      authenticatedBy: authenticatedUserId,
      ipAddress,
      queryParams: req.query,
    });
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error while fetching user profiles.",
        error: error.message,
      });
    }
  }
};
