// membership-service/src/handlers/getMembershipPlansHandler.js
import { getMembershipPlansController } from "../controllers/getMembershipPlansController.js";
import logger from "../utils/logger.js"; // Ensure you have a logger in membership-service

export const getMembershipPlansHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A"; // User ID if authenticated

  // Extract query parameters
  const { page, limit, sort, ...filters } = req.query;

  // Parse page and limit to integers, with default values
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;

  // Parse the 'sort' parameter. Expects a format like 'field:asc' or 'field:desc'
  let parsedSort = {};
  if (sort) {
    const [sortBy, sortOrder] = sort.split(":");
    if (sortBy && (sortOrder === "asc" || sortOrder === "desc")) {
      parsedSort[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      logger.warn("Invalid sort parameter received for membership plans", {
        sort,
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
    }
  } else {
    // Default sorting if not specified
    parsedSort = { price: 1 }; // Default to sorting by price ascending
  }

  try {
    const { plans, pagination } = await getMembershipPlansController(
      filters,
      parsedPage,
      parsedLimit,
      parsedSort
    );

    res.status(200).json({ plans, pagination });
    logger.audit("Membership plans fetched successfully", {
      authenticatedBy: authenticatedUserId,
      ipAddress,
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort: parsedSort,
    });
    logger.info("Membership plans list sent", {
      authenticatedBy: authenticatedUserId,
      ipAddress,
      planCount: plans.length,
      pagination,
    });
  } catch (error) {
    logger.error("Error in getMembershipPlansHandler:", {
      message: error.message,
      stack: error.stack,
      authenticatedBy: authenticatedUserId,
      ipAddress,
      queryParams: req.query,
    });
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error while fetching membership plans.",
        error: error.message,
      });
    }
  }
};
