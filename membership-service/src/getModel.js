<<<<<<< HEAD
import mongoose from "mongoose";
import userSchema from "./models/membership.js";

let membershipModel;

export const getMembershipModel = () => {
  if (!membershipModel) {
    membershipModel = mongoose.model("Membership", userSchema);
  }
  return membershipModel;
=======
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
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
};
