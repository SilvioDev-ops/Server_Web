import Membership from "./models/membershipModel.js";
import MembershipPlan from "./models/membershipPlanModel.js";

export const getMembershipModel = (modelName) => {
  switch (modelName) {
    case "Membership":
      return Membership;
    case "MembershipPlan":
      return MembershipPlan;
    default:
      throw new Error(
        `Model '${modelName}' not found or not handled by getMembershipModel.`
      );
  }
};
