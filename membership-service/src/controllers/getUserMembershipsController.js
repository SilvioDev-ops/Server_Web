import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";
export const getUserMembershipsController = async (
  userId,
  filters = {},
  page = 1,
  limit = 10,
  sort = {}
) => {
  const Membership = getMembershipModel("Membership");

  let query = { userId: userId };

  if (filters.status) {
    query.status = { $regex: filters.status, $options: "i" };
  }
  if (filters.membershipType) {
    query.membershipType = { $regex: filters.membershipType, $options: "i" };
  }
  if (filters.startDateMin) {
    query.startDate = {
      ...query.startDate,
      $gte: new Date(filters.startDateMin),
    };
  }
  if (filters.startDateMax) {
    query.startDate = {
      ...query.startDate,
      $lte: new Date(filters.startDateMax),
    };
  }
  if (filters.endDateMin) {
    query.endDate = { ...query.endDate, $gte: new Date(filters.endDateMin) };
  }
  if (filters.endDateMax) {
    query.endDate = { ...query.endDate, $lte: new Date(filters.endDateMax) };
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  logger.debug(
    `Fetching memberships for user ID: ${userId} with filters, pagination, and sorting`,
    { filters, page: parsedPage, limit: parsedLimit, sort }
  );

  try {
    const totalItems = await Membership.countDocuments(query);

    const memberships = await Membership.find(query)
      .select("-__v")
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit);

    logger.info("User memberships fetched successfully", {
      userId,
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort,
      totalItems,
      retrievedCount: memberships.length,
    });

    return {
      memberships,
      pagination: {
        totalItems,
        currentPage: parsedPage,
        itemsPerPage: parsedLimit,
        totalPages: Math.ceil(totalItems / parsedLimit),
      },
    };
  } catch (error) {
    logger.error("Error in getUserMembershipsController:", {
      message: error.message,
      stack: error.stack,
      userId,
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort,
    });
    throw error;
  }
};
