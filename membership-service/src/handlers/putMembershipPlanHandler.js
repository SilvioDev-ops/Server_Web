import { validationResult } from "express-validator";
import { putMembershipPlanController } from "../controllers/putMembershipPlanController.js";
import logger from "../utils/logger.js";

export const putMembershipPlanHandler = async (req, res) => {
  const ipAddress = req.ip;
  const authenticatedUserId = req.user ? req.user._id : "N/A";

  const planId = req.params.planId;
  const updateData = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn("Membership plan update request failed validation", {
      errors: errors.array(),
      planId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
      body: req.body,
    });
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedPlan = await putMembershipPlanController(planId, updateData);

    res.status(200).json(updatedPlan);
    logger.audit("Membership plan update request successfully handled", {
      planId: updatedPlan._id,
      name: updatedPlan.name,
      authenticatedBy: authenticatedUserId,
      ipAddress,
      updatedFields: Object.keys(updateData),
    });
    logger.info("Membership plan update request successfully handled", {
      planId: updatedPlan._id,
      authenticatedBy: authenticatedUserId,
      ipAddress,
    });
    return;
  } catch (error) {
    logger.error("Error in putMembershipPlanHandler:", {
      message: error.message,
      stack: error.stack,
      planId,
      ipAddress,
      authenticatedBy: authenticatedUserId,
      body: req.body,
    });

    if (!res.headersSent) {
      if (error.message === "Membership plan not found.") {
        return res.status(404).json({ message: error.message });
      }
      if (
        error.message.includes(
          "A membership plan with this name already exists."
        )
      ) {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({
        message: "Internal server error during membership plan update.",
        error: error.message,
      });
    }
  }
};
