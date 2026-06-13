import axios from "axios";

export const getUserFromAuthService = async (userId, token) => {
  try {
    const AUTH_SERVICE_API_URL_GET_USER =
      process.env.AUTH_SERVICE_API_URL_GET_USER;
    const authServiceResponse = await axios.get(
      `${AUTH_SERVICE_API_URL_GET_USER}/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const user = authServiceResponse.data;
    return user;
  } catch (error) {
    console.error("Error al obtener usuario de auth-service:", error);
    throw error;
  }
};
