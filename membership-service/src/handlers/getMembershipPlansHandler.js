import { getMembershipPlansController } from "../controllers/getMembershipPlansController.js";
import logger from "../utils/logger.js";

export const getMembershipPlansHandler = async (req, res) => {
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
      logger.warn("Invalid sort parameter received for membership plans", {
        sort,
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
    }
  } else {
    parsedSort = { price: 1 };
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
