import { cancelMembershipController } from "../controllers/cancelMembershipController.js";
import logger from "../utils/logger.js";
import { getMembershipModel } from "../getModel.js";

export const cancelMembershipHandler = async (req, res) => {
  const membershipId = req.params.membershipId;
  const cancellationReason = req.body.cancellationReason || null;
  const authenticatedUserId = req.user ? req.user._id : "N/A";
  const ipAddress = req.ip;

  try {
    const membership = await getMembershipModel("Membership").findById(
      membershipId
    );
    if (
      membership &&
      membership.userId.toString() !== authenticatedUserId &&
      !req.user.roles.includes("Admin")
    ) {
      logger.warn("Unauthorized attempt to cancel membership", {
        membershipId,
        authenticatedBy: authenticatedUserId,
        ipAddress,
      });
      return res.status(403).json({
        message:
          "Forbidden: You can only cancel your own memberships or must be an Admin.",
      });
    }

    const cancelledMembership = await cancelMembershipController(
      membershipId,
      cancellationReason
    );

    res.status(200).json({
      message: "Membership cancelled successfully.",
      cancelledMembership,
    });
    logger.audit("Membership cancellation request successfully handled", {
      membershipId: cancelledMembership._id,
      userId: cancelledMembership.userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    logger.info("Membership cancellation request successfully handled", {
      membershipId: cancelledMembership._id,
      userId: cancelledMembership.userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error in cancelMembershipHandler:", {
      message: error.message,
      stack: error.stack,
      membershipId,
      cancellationReason,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    if (!res.headersSent) {
      if (error.message === "Membership not found.") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({
        message: "Internal server error during membership cancellation.",
        error: error.message,
      });
    }
  }
};
