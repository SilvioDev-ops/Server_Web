import { verifyToken } from "./handleJsonWebToken.js";
import { getUserFromAuthService } from "../controllers/getUserFromAuthService.js";

export const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send("NOT_TOKEN");
    }

    const token = req.headers.authorization.split(" ").pop();
    const dataToken = await verifyToken(token);

    if (!dataToken) {
      return res.status(401).send("NOT_PAYLOAD_DATA");
    }

    const user = await getUserFromAuthService(dataToken.id, token);

    if (!user) {
      return res.status(401).send("USER_NOT_FOUND");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(401).send("USER_NOT_FOUND");
    }
    return res.status(401).send("ERROR_VERIFYING_USER");
  }
};
