import { getAllMembershipController } from "../controllers/getAllMembershipController.js";
<<<<<<< HEAD

export const getAllMembershipHandler = async (req, res) => {
  try {
    const memberships = await getAllMembershipController(req, res);
    if (!memberships) {
      return res.status(404).json({ message: "No memberships found" });
    }
    res.status(200).json(memberships);
  } catch (error) {
    console.error("Error in getAllMembershipHandler:", error);
    res.status(500).json({ message: "Internal server error" });
=======
import logger from "../utils/logger.js";
export const getAllMembershipHandler = async (req, res) => {
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
      logger.warn(
        "HANDLER: Invalid sort parameter received for all memberships",
        { sort, ipAddress, authenticatedBy: authenticatedUserId }
      );
    }
  } else {
    parsedSort = { startDate: -1 };
  }

  logger.debug(
    "HANDLER: Recibiendo solicitud para obtener todas las membresías",
    { ipAddress, authenticatedBy: authenticatedUserId, queryParams: req.query }
  );

  try {
    const { memberships, pagination } = await getAllMembershipController(
      filters,
      parsedPage,
      parsedLimit,
      parsedSort
    );

    if (memberships.length === 0 && pagination.totalItems === 0) {
      logger.info("HANDLER: No memberships found matching criteria", {
        filters,
        ipAddress,
        authenticatedBy: authenticatedUserId,
      });
      return res
        .status(404)
        .json({ message: "No memberships found matching the criteria." });
    }

    res.status(200).json({ memberships, pagination });
    logger.audit("HANDLER: All memberships fetched successfully", {
      authenticatedBy: authenticatedUserId,
      ipAddress,
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort: parsedSort,
      retrievedCount: memberships.length,
    });
    logger.info("HANDLER: All memberships list sent", {
      authenticatedBy: authenticatedUserId,
      ipAddress,
      membershipCount: memberships.length,
      pagination,
    });
  } catch (error) {
    logger.error("HANDLER: Error in getAllMembershipHandler:", {
      message: error.message,
      stack: error.stack,
      authenticatedBy: authenticatedUserId,
      ipAddress,
      queryParams: req.query,
    });
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error while fetching all memberships.",
        error: error.message,
      });
    }
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
  }
};
