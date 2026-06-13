import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const suspendMembershipController = async (
  membershipId,
  action,
  reason = null
) => {
  const Membership = getMembershipModel("Membership");

  logger.debug(`Attempting to ${action} membership with ID: ${membershipId}`);

  try {
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      logger.warn("Membership not found for suspension/activation", {
        membershipId,
      });
      throw new Error("Membership not found.");
    }

    let updatedMembership;
    if (action === "suspend") {
      if (membership.status === "Suspended") {
        logger.info("Membership is already suspended", { membershipId });
        return membership;
      }
      updatedMembership = await Membership.findByIdAndUpdate(
        membershipId,
        {
          status: "Suspended",
          suspensionDate: new Date(),
          suspensionReason: reason,
          cancellationDate: undefined,
          cancellationReason: undefined,
        },
        { new: true }
      );
      logger.audit("Membership suspended successfully", {
        membershipId: updatedMembership._id,
        userId: updatedMembership.userId,
        reason,
      });
      logger.info("Membership status updated to Suspended in database", {
        membershipId: updatedMembership._id,
        userId: updatedMembership.userId,
      });
    } else if (action === "activate") {
      if (membership.status === "Active") {
        logger.info("Membership is already active", { membershipId });
        return membership;
      }
      updatedMembership = await Membership.findByIdAndUpdate(
        membershipId,
        {
          status: "Active",
          suspensionDate: undefined,
          suspensionReason: undefined,
        },
        { new: true }
      );
      logger.audit("Membership activated successfully", {
        membershipId: updatedMembership._id,
        userId: updatedMembership.userId,
      });
      logger.info("Membership status updated to Active in database", {
        membershipId: updatedMembership._id,
        userId: updatedMembership.userId,
      });
    } else {
      logger.warn("Invalid action for suspendMembershipController", {
        membershipId,
        action,
      });
      throw new Error("Invalid action. Must be 'suspend' or 'activate'.");
    }

    return updatedMembership;
  } catch (error) {
    logger.error("Error in suspendMembershipController:", {
      message: error.message,
      stack: error.stack,
      membershipId,
      action,
      reason,
    });
    throw error;
  }
};
