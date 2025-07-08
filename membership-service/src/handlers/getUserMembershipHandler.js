import { getUserMembershipsController } from "../controllers/getUserMembershipsController.js";
import logger from "../utils/logger.js";

export const getUserMembershipsHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : null;
  if (!authenticatedUserId) {
    logger.warn(
      "Unauthorized attempt to fetch user memberships: No authenticated user ID.",
      { ipAddress }
    );
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated." });
  }

  const { page, limit, sort, ...filters } = req.query;

  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;

  let parsedSort = {};
  if (sort) {
    const [sortBy, sortOrder] = sort.split(":");
    if (sortBy && (sortOrder === "asc" || sortOrder === "desc")) {
      parsedSort[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      logger.warn("Invalid sort parameter received for user memberships", {
        sort,
        authenticatedBy: authenticatedUserId,
        ipAddress,
      });
    }
  } else {
    parsedSort = { startDate: -1 };
  }

  try {
    const { memberships, pagination } = await getUserMembershipsController(
      authenticatedUserId,
      filters,
      parsedPage,
      parsedLimit,
      parsedSort
    );

    res.status(200).json({ memberships, pagination });
    logger.audit("User memberships fetched successfully", {
      userId: authenticatedUserId,
      ipAddress,
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort: parsedSort,
      count: memberships.length,
    });
    logger.info("User memberships list sent", {
      userId: authenticatedUserId,
      ipAddress,
      membershipCount: memberships.length,
      pagination,
    });
  } catch (error) {
    logger.error("Error in getUserMembershipsHandler:", {
      message: error.message,
      stack: error.stack,
      userId: authenticatedUserId,
      ipAddress,
      queryParams: req.query,
    });
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error while fetching user memberships.",
        error: error.message,
      });
    }
  }
};
