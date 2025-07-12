import { renewMembershipController } from "../controllers/renewMembershipController.js";
import logger from "../utils/logger.js";

export const renewMembershipHandler = async (req, res) => {
  const membershipId = req.params.membershipId;
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  try {
    const renewedMembership = await renewMembershipController(membershipId);

    res
      .status(200)
      .json({ message: "Membership renewed successfully.", renewedMembership });
    logger.audit("Membership renewal request successfully handled", {
      membershipId: renewedMembership._id,
      userId: renewedMembership.userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    logger.info("Membership renewal request successfully handled", {
      membershipId: renewedMembership._id,
      userId: renewedMembership.userId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
  } catch (error) {
    logger.error("Error in renewMembershipHandler:", {
      message: error.message,
      stack: error.stack,
      membershipId,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    if (!res.headersSent) {
      if (
        error.message === "Membership not found." ||
        error.message === "Associated membership plan not found."
      ) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({
        message: "Internal server error during membership renewal.",
        error: error.message,
      });
    }
  }
};
