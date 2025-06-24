import { Router } from "express";
import { postUserProfileHandler } from "../handlers/postUserProfileHandler.js";
import { getUserProfileHandler } from "../handlers/getUserProfileHandler.js";
import { getAllUsersProfileHandler } from "../handlers/getAllUsersProfileHandler.js";
import { deleteUserProfileHandler } from "../handlers/deleteUserProfileHandler.js";
import { putUserProfileHandler } from "../handlers/putUserProfileHandler.js";
import { checkRol } from "../utils/checkRol.js";
import { authMiddleware } from "../middlewares/authenticateToken.js";
const userProfileRouter = Router();

userProfileRouter.post("/postUserProfile", postUserProfileHandler);

userProfileRouter.get(
  "/getUserProfile/:userId",
  authMiddleware,
  checkRol(["Client"]),
  getUserProfileHandler
);

userProfileRouter.get(
  "/getAllUsersProfile",
  authMiddleware,
  checkRol(["Admin"]),
  getAllUsersProfileHandler
);

userProfileRouter.delete(
  "/deleteUserProfile/:userId",
  authMiddleware,
  checkRol(["Client", "Admin"]),
  deleteUserProfileHandler
);

userProfileRouter.put(
  "/putUserProfile/:userId",
  authMiddleware,
  checkRol(["Admin"]),
  putUserProfileHandler
);

export default userProfileRouter;
