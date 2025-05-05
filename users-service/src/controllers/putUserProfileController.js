import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import { getUserModel } from "../getModel.js";
const UserProfile = getUserModel();
const AUTH_SERVICE_API_URL_PUT_USER = process.env.AUTH_SERVICE_API_URL_PUT_USER;

export const putUserProfileController = async (userId, userData) => {
  console.log(userData);

  try {
    const updatedProfile = await UserProfile.findByIdAndUpdate(
      userId,
      userData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      throw new Error("Perfil de usuario no encontrado");
    }

    if (userData.email || userData.password) {
      const authServiceApiUrl = `${AUTH_SERVICE_API_URL_PUT_USER}/${userData.userId}`;
      try {
        const authResponse = await axios.put(authServiceApiUrl, {
          email: userData.email,
          password: userData.password,
        });
        console.log("Respuesta de auth-service:", authResponse.data);
      } catch (authError) {
        console.error(
          "Error al actualizar usuario en auth-service:",
          authError.message
        );
        throw new Error(
          "Error al actualizar usuario de autenticación: " + authError.message
        );
      }
    }
    return updatedProfile;
  } catch (error) {
    console.error(
      "Error al actualizar el perfil de usuario en el controlador:",
      error
    );
    throw error;
  }
};
