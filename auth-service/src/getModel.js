import mongoose from "mongoose";
import userSchema from "./models/user.js";

let UserModel;

export const getUserModel = () => {
  if (!UserModel) {
    UserModel = mongoose.model("User", userSchema);
  }
  return UserModel;
};
