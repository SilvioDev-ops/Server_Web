import { getUserModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const getAllUsersProfileController = async (
  filters = {},
  page = 1,
  limit = 10,
  sort = {}
) => {
  const UserProfile = getUserModel();

  let query = {};

  if (filters.email) {
    query.email = { $regex: filters.email, $options: "i" };
  }
  if (filters.firstName) {
    query.firstName = { $regex: filters.firstName, $options: "i" };
  }
  if (filters.lastName) {
    query.lastName = { $regex: filters.lastName, $options: "i" };
  }
  if (filters.roles) {
    query.roles = { $in: filters.roles.split(",").map((role) => role.trim()) };
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  if (filters.city) {
    query["address.city"] = { $regex: filters.city, $options: "i" };
  }

  if (filters.includeDeleted !== "true") {
    query.$or = [{ isDeleted: false }, { isDeleted: { $exists: false } }];
  } else {
    if (filters.isDeleted !== undefined) {
      query.isDeleted =
        filters.isDeleted === "true" || filters.isDeleted === true;
    }
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  try {
    const totalItems = await UserProfile.countDocuments(query);

    const userProfiles = await UserProfile.find(query)
      .select("-__v")
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit);

    logger.info("User profiles fetched with filters, pagination, and sorting", {
      filters,
      page: parsedPage,
      limit: parsedLimit,
      sort,
      totalItems,
      retrievedCount: userProfiles.length,
    });

    return {
      userProfiles,
      pagination: {
        totalItems,
        currentPage: parsedPage,
        itemsPerPage: parsedLimit,
        totalPages: Math.ceil(totalItems / parsedLimit),
      },
    };
  } catch (error) {
    logger.error("Error in getAllUsersProfileController:", {
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
