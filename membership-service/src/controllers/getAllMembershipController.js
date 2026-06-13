<<<<<<< HEAD
import { getMembershipModel } from "../getModel.js"; 

export const getAllMembershipController = async (req, res) => { 
   
        const Membership = getMembershipModel(); 
        const memberships = await Membership.find(); 
         
        if (!memberships) {
            return res.status(404).json({ message: "No memberships found" }); 
        }
        return memberships
    }
=======
import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const getAllMembershipController = async (
  filters = {},
  page = 1,
  limit = 10,
  sort = {}
) => {
  const Membership = getMembershipModel("Membership");

  let query = {};

  if (filters.userId) {
    query.userId = filters.userId;
  }
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
  if (filters.includeCancelledAndExpired !== "true") {
    query.status = { $nin: ["Cancelled", "Expired"] };
  } else {
    if (filters.status) {
      query.status = { $regex: filters.status, $options: "i" };
    }
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (parsedPage - 1) * parsedLimit;

  logger.debug(
    "CONTROLLER: Fetching all memberships with filters, pagination, and sorting",
    { filters, page: parsedPage, limit: parsedLimit, sort }
  );

  try {
    const totalItems = await Membership.countDocuments(query);

    const memberships = await Membership.find(query)
      .select("-__v")
      .sort(sort)
      .skip(skip)
      .limit(parsedLimit);

    logger.info("CONTROLLER: Memberships fetched successfully", {
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
    logger.error("CONTROLLER: Error in getAllMembershipController:", {
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
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
