import { getUserModel } from "../getModel.js";

export const putUserController = async (userId, userData) => {
  const User = getUserModel();
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user in controller:", error);
    throw error;
  }
};
