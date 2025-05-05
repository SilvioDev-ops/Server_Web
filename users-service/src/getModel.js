import mongoose from "mongoose";
import userProfileSchema from "./models/usersProfile.js";

let UserModel;

export const getUserModel = () => {
  if (!UserModel) {
    UserModel = mongoose.model("UserProfile", userProfileSchema);
  }
  return UserModel;
};
