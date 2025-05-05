import { getUserModel } from "../getModel.js";

export const getUserController = async (userId) => {
  const User = getUserModel();
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const userData = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return userData;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    throw error;
  }
};
