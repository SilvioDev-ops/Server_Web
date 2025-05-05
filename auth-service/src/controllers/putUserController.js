import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";

export const putUserController = async (userId, userData) => {
  const User = getUserModel();
  try {
    if (userData.password) {
      userData.password = await handlePassword.encrypt(userData.password);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
      runValidators: true,
    });
    return updatedUser;
  } catch (error) {
    console.error("Error al actualizar usuario en el controlador:", error);
    throw error;
  }
};
