import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const cancelMembershipController = async (
  membershipId,
  cancellationReason = null
) => {
  const Membership = getMembershipModel("Membership");

  logger.debug(`Attempting to cancel membership with ID: ${membershipId}`, {
    cancellationReason,
  });

  try {
    const cancelledMembership = await Membership.findByIdAndUpdate(
      membershipId,
      {
        status: "Cancelled",
        cancellationDate: new Date(),
        cancellationReason: cancellationReason,
        isAutoRenew: false,
      },
      { new: true }
    );

    if (!cancelledMembership) {
      logger.warn("Membership not found for cancellation", { membershipId });
      throw new Error("Membership not found.");
    }

    logger.audit("Membership cancelled successfully", {
      membershipId: cancelledMembership._id,
      userId: cancelledMembership.userId,
      reason: cancellationReason,
    });
    logger.info("Membership status updated to Cancelled in database", {
      membershipId: cancelledMembership._id,
      userId: cancelledMembership.userId,
    });

    return cancelledMembership;
  } catch (error) {
    logger.error("Error in cancelMembershipController:", {
      message: error.message,
      stack: error.stack,
      membershipId,
      cancellationReason,
    });
    throw error;
  }
};
