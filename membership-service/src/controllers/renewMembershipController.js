// membership-service/src/controllers/renewMembershipController.js
import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const renewMembershipController = async (membershipId) => {
  const Membership = getMembershipModel("Membership");
  const MembershipPlan = getMembershipModel("MembershipPlan");

  logger.debug(`Attempting to renew membership with ID: ${membershipId}`);

  try {
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      logger.warn("Membership not found for renewal", { membershipId });
      throw new Error("Membership not found.");
    }

    const selectedPlan = await MembershipPlan.findById(membership.planId);
    if (!selectedPlan) {
      logger.error("Associated membership plan not found for renewal", {
        membershipId,
        planId: membership.planId,
      });
      throw new Error("Associated membership plan not found.");
    }

    const newStartDate = new Date();

    const newEndDate = new Date(newStartDate);
    switch (selectedPlan.durationUnit) {
      case "days":
        newEndDate.setDate(newEndDate.getDate() + selectedPlan.durationValue);
        break;
      case "months":
        newEndDate.setMonth(newEndDate.getMonth() + selectedPlan.durationValue);
        break;
      case "years":
        newEndDate.setFullYear(
          newEndDate.getFullYear() + selectedPlan.durationValue
        );
        break;
      default:
        logger.error("Invalid duration unit in associated plan for renewal", {
          membershipId,
          durationUnit: selectedPlan.durationUnit,
        });
        throw new Error("Invalid duration unit in associated plan.");
    }

    const updatedMembership = await Membership.findByIdAndUpdate(
      membershipId,
      {
        startDate: newStartDate,
        endDate: newEndDate,
        status: "Active",
        nextRenewalDate: membership.isAutoRenew ? newEndDate : undefined,
        cancellationDate: undefined,
        cancellationReason: undefined,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    logger.debug("Result of findByIdAndUpdate in renewMembershipController", {
      updatedMembership: updatedMembership
        ? updatedMembership.toObject()
        : null,
    });

    if (!updatedMembership) {
      logger.warn("findByIdAndUpdate returned null after attempted renewal", {
        membershipId,
      });
      throw new Error("Failed to update membership during renewal.");
    }

    logger.audit("Membership renewed successfully", {
      membershipId: updatedMembership._id,
      userId: updatedMembership.userId,
      newEndDate: updatedMembership.endDate,
    });
    logger.info(
      "Membership status updated to Active and dates renewed in database",
      { membershipId: updatedMembership._id, userId: updatedMembership.userId }
    );

    return updatedMembership;
  } catch (error) {
    logger.error("Error in renewMembershipController:", {
      message: error.message,
      stack: error.stack,
      membershipId,
    });
    throw error;
  }
};
