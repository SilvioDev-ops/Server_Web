import { getMembershipModel } from "../getModel.js";

export const postMembershipController = async (req, res) => {
  console.log("CONTROLLER: Iniciando postMembershipController.");
  const {
    planId,
    isAutoRenew,
    isTrial,
    paymentTransactionId,
    startDate, 
    endDate,   
    status     
  } = req.body;

  const userId = req.user ? req.user._id : null;

  try {
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }
    if (!planId) {
      return res.status(400).json({ message: "Missing planId for membership creation." });
    }

    const Membership = getMembershipModel("Membership"); 
    const MembershipPlan = getMembershipModel("MembershipPlan"); 
    

    const selectedPlan = await MembershipPlan.findById(planId);

    if (!selectedPlan) {
      return res.status(404).json({ message: "Membership plan not found." });
    }

    const existingActiveMembership = await Membership.findOne({
      userId: userId,
      status: "Active",
      planId: planId
    });

    if (existingActiveMembership) {
      return res.status(409).json({ message: "User already has an active subscription for this plan." });
    }
    if (!selectedPlan.isAvailable) {
      return res.status(400).json({ message: "Selected membership plan is not available." });
    }
    const {
        name: membershipType,
        price,
        currency,
        durationValue,
        durationUnit,
    } = selectedPlan;

    const actualStartDate = startDate ? new Date(startDate) : new Date();
    let actualEndDate;

    if (endDate) {
      actualEndDate = new Date(endDate);
    } else {
      actualEndDate = new Date(actualStartDate);
      switch (durationUnit) {
        case "days":
          actualEndDate.setDate(actualEndDate.getDate() + durationValue);
          break;
        case "months":
          actualEndDate.setMonth(actualEndDate.getMonth() + durationValue);
          break;
          case "years":
            actualEndDate.setFullYear(actualEndDate.getFullYear() + durationValue);
            break;
        default:
          return res.status(500).json({ message: "Invalid duration unit in selected plan." });
      }
    }


    const newMembershipData = {
      userId: userId,
      planId: selectedPlan._id,
      membershipType,
      price,
      currency,
      durationValue,
      durationUnit,
      startDate: actualStartDate,
      endDate: actualEndDate,
      status: status || (isTrial ? "Trial" : "Active"),
      paymentTransactionId: paymentTransactionId,
      isAutoRenew: isAutoRenew || false,
      isTrial: isTrial || false,
      nextRenewalDate: isAutoRenew ? actualEndDate : undefined
    };

    const newMembership = new Membership(newMembershipData);
    const savedMembership = await newMembership.save();

    res.status(201).json(savedMembership);

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error in controller", error: error.message });
    }
  }
};