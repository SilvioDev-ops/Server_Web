import mongoose from "mongoose";
import userSchema from "./models/membership.js";

let membershipModel;

export const getMembershipModel = () => {
  if (!membershipModel) {
    membershipModel = mongoose.model("Membership", userSchema);
  }
  return membershipModel;
};
