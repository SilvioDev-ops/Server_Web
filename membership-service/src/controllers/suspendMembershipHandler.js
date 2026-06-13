import { suspendMembershipController } from "../controllers/suspendMembershipController.js";
import logger from "../utils/logger.js";

export const suspendMembershipHandler = async (req, res) => {
  const membershipId = req.params.membershipId;
  const { action, reason } = req.body;
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  try {
    if (action !== "suspend" && action !== "activate") {
      logger.warn(
        "Invalid action provided for membership suspension/activation",
        {
          membershipId,
          action,
          authenticatedBy: authenticatedUserId,
          ipAddress,
        }
      );
      return res.status(400).json({
        message: "Invalid action. 'action' must be 'suspend' or 'activate'.",
      });
    }

    if (action === "suspend" && !reason) {
      logger.warn("Reason is required for suspending a membership", {
        membershipId,
        authenticatedBy: authenticatedUserId,
        ipAddress,
      });
      return res
        .status(400)
        .json({ message: "Reason is required to suspend a membership." });
    }

    const updatedMembership = await suspendMembershipController(
      membershipId,
      action,
      reason
    );

    let successMessage = `Membership ${action}d successfully.`;
    if (action === "suspend") {
      successMessage = "Membership suspended successfully.";
    } else if (action === "activate") {
      successMessage = "Membership activated successfully.";
    }

    res.status(200).json({ message: successMessage, updatedMembership });
    logger.audit(`Membership ${action} request successfully handled`, {
      membershipId: updatedMembership._id,
      userId: updatedMembership.userId,
      action,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    logger.info(`Membership ${action} request successfully handled`, {
      membershipId: updatedMembership._id,
      userId: updatedMembership.userId,
      action,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error in suspendMembershipHandler:", {
      message: error.message,
      stack: error.stack,
      membershipId,
      action,
      reason,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    if (!res.headersSent) {
      if (error.message === "Membership not found.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({
        message: `Internal server error during membership ${action}.`,
        error: error.message,
      });
    }
  }
};
