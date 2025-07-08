import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const getMembershipPlansController = async (
  filters = {},
  page = 1,
  limit = 10,
  sort = {}
) => {
  const MembershipPlan = getMembershipModel("MembershipPlan");

  let query = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }

  if (filters.membershipType) {
    query.membershipType = { $regex: filters.membershipType, $options: "i" };
  }

  if (filters.priceMin !== undefined) {
    query.price = { ...query.price, $gte: parseFloat(filters.priceMin) };
  }

  if (filters.priceMax !== undefined) {
    query.price = { ...query.price, $lte: parseFloat(filters.priceMax) };
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }

  if (filters.includeInactive !== "true") {
    query.isActive = true;
  } else {
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === "true" || filters.isActive === true;
    }
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  logger.debug(
    "Fetching membership plans with filters, pagination, and sorting",
    { filters, page: parsedPage, limit: parsedLimit, sort }
  );

  try {
    const totalItems = await MembershipPlan.countDocuments(query);

    const plans = await MembershipPlan.find(query)
      .select("-__v")
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit);

    logger.info("Membership plans fetched successfully", {
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort,
      totalItems,
      retrievedCount: plans.length,
    });

    return {
      plans,
      pagination: {
        totalItems,
        currentPage: parsedPage,
        itemsPerPage: parsedLimit,
        totalPages: Math.ceil(totalItems / parsedLimit),
      },
    };
  } catch (error) {
    logger.error("Error in getMembershipPlansController:", {
      message: error.message,
      stack: error.stack,
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort,
    });
    throw error;
  }
};
