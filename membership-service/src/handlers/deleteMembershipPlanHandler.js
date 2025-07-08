import { deleteMembershipPlanController } from "../controllers/deleteMembershipPlanController.js";
import logger from "../utils/logger.js";

export const deleteMembershipPlanHandler = async (req, res) => {
  const planId = req.params.planId;
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";
  try {
    const deletedPlan = await deleteMembershipPlanController(planId);

    res.status(200).json({
      message: "Membership plan soft deleted successfully.",
      deletedPlan,
    });
    logger.audit("Membership plan soft delete request successfully handled", {
      planId: deletedPlan._id,
      name: deletedPlan.name,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    logger.info("Membership plan soft delete request successfully handled", {
      planId: deletedPlan._id,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error in deleteMembershipPlanHandler:", {
      message: error.message,
      stack: error.stack,
      planId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
    });
    if (!res.headersSent) {
      if (error.message === "Membership plan not found.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({
        message: "Internal server error during membership plan deletion.",
        error: error.message,
      });
    }
  }
};
