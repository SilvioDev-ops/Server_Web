import { getMembershipModel } from "../getModel.js";
import logger from "../utils/logger.js";

export const putMembershipPlanController = async (planId, updateData) => {
  const MembershipPlan = getMembershipModel("MembershipPlan");
  logger.debug(`Attempting to update membership plan with ID: ${planId}`, {
    updateData,
  });

  try {
    const updatedPlan = await MembershipPlan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      logger.warn("Membership plan not found for update", {
        planId,
        updateData,
      });
      throw new Error("Membership plan not found.");
    }

    logger.audit("Membership plan updated successfully", {
      planId: updatedPlan._id,
      name: updatedPlan.name,
      updatedFields: Object.keys(updateData),
    });
    logger.info("Membership plan updated in database", {
      planId: updatedPlan._id,
      name: updatedPlan.name,
    });

    return updatedPlan;
  } catch (error) {
    logger.error("Error in putMembershipPlanController:", {
      message: error.message,
      stack: error.stack,
      planId,
      updateData,
    });
    if (error.code === 11000) {
      throw new Error(`A membership plan with this name already exists.`);
    }
    throw error;
  }
};
