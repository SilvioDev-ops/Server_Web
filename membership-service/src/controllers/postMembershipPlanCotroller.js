import { getMembershipModel } from "../getModel.js";

export const postMembershipPlanController = async (req) => {
    console.log("Received request to create a new membership plan:", req.body);
    
    const {
        name,
        description,
        price,
        currency,
        durationValue,
        durationUnit,
        features,
        isAvailable
    } = req.body;

    if (!name || !description || price === undefined || !durationValue || !durationUnit) {
        throw new Error("Missing required fields for membership plan creation.");
    }
    if (price < 0) {
        throw new Error("Price cannot be negative.");
    }
    if (durationValue < 1) {
        throw new Error("Duration value must be at least 1.");
    }

    const MembershipPlan = getMembershipModel("MembershipPlan");

    const newPlan = new MembershipPlan({
        name,
        description,
        price,
        currency,
        durationValue, 
        durationUnit,
        features: features || [], 
        isAvailable: isAvailable !== undefined ? isAvailable : true 
    });

    const savedPlan = await newPlan.save();

    return savedPlan;
};