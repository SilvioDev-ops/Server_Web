import axios from "axios";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const AUTH_SERVICE_API_URL_GET_USER = process.env.AUTH_SERVICE_API_URL_GET_USER;

export const getUserFromAuthService = async (userId, token) => {
  logger.debug(`Attempting to fetch user ${userId} from auth-service.`);
  try {
    const authServiceResponse = await axios.get(
      `${AUTH_SERVICE_API_URL_GET_USER}/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const user = authServiceResponse.data;
    logger.info(`User ${userId} fetched successfully from auth-service.`, {
      userId,
      email: user.email,
    });
    return user;
  } catch (error) {
    logger.error("Error al obtener usuario de auth-service:", {
      message: error.message,
      stack: error.stack,
      userId,
      response_data: error.response ? error.response.data : "N/A",
    });
    throw error;
  }
};
