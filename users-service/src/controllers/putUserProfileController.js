import { getUserModel } from "../getModel.js"; // Suponiendo que getUserModel es para tu modelo de UserProfile

const UserProfile = getUserModel(); // Obtén el modelo de UserProfile (ej. UserProfile o User)

export const putUserProfileController = async (userId, userData) => {
  try {
    const updatedProfile = await UserProfile.findByIdAndUpdate(
      userId,
      userData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      throw new Error("Perfil de usuario no encontrado.");
    }
    return updatedProfile;
  } catch (error) {
    console.error(
      "Error al actualizar el perfil de usuario en el controlador:",
      error.message
    );
    throw error;
  }
};
