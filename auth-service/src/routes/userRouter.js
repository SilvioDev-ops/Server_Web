import express from "express";
import { postUserHandler } from "../handlers/postUserHandler.js";
import { localLoginHandler } from "../handlers/localLoginHandler.js";
import { putUserHandler } from "../handlers/putUserHandler.js";
import { getUserHandler } from "../handlers/getUserHandler.js";
import { authMiddleware } from "../middlewares/authenticateToken.js";
import { checkRol } from "../utils/checkRol.js";
const userRouter = express.Router();

userRouter.post("/register", postUserHandler);

userRouter.post("/login", localLoginHandler);

userRouter.put("/updateUser/:userId", putUserHandler);

userRouter.get(
  "/getUser/:userId",
  authMiddleware,
  checkRol(["Client", "Admin"]),
  getUserHandler
);

export default userRouter;
