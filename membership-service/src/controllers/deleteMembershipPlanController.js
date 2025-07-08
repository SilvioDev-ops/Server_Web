import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const deleteMembershipPlanController = async (planId) => {
  const MembershipPlan = getMembershipModel("MembershipPlan");

  logger.debug(`Attempting to soft delete membership plan with ID: ${planId}`);

  try {
    const deletedPlan = await MembershipPlan.findByIdAndUpdate(
      planId,
      { isActive: false, isDeleted: true },
      { new: true }
    );

    if (!deletedPlan) {
      logger.warn("Membership plan not found for soft delete", { planId });
      throw new Error("Membership plan not found.");
    }

    logger.audit("Membership plan soft deleted successfully", {
      planId: deletedPlan._id,
      name: deletedPlan.name,
    });
    logger.info("Membership plan marked as deleted in database", {
      planId: deletedPlan._id,
      name: deletedPlan.name,
    });

    return deletedPlan;
  } catch (error) {
    logger.error("Error in deleteMembershipPlanController:", {
      message: error.message,
      stack: error.stack,
      planId,
    });
    throw error;
  }
};
