import express from "express";
import { postUserHandler } from "../handlers/postUserHandler.js";
import { localLoginHandler } from "../handlers/localLoginHandler.js";
import { putUserHandler } from "../handlers/putUserHandler.js";
import { getUserHandler } from "../handlers/getUserHandler.js";
import { authMiddleware } from "../middlewares/authenticateToken.js";
import { registerValidator } from "../validators/registerValidator.js";
import { loginValidator } from "../validators/loginValidator.js";
import { updatePasswordValidator } from "../validators/updatePasswordValidator.js";
import { checkRol } from "../utils/checkRol.js";
const userRouter = express.Router();

userRouter.post("/register", registerValidator, postUserHandler);

userRouter.post("/login", loginValidator, localLoginHandler);

userRouter.put(
  "/updateUser/:userId",
  authMiddleware,
  checkRol(["Admin", "Client"]),
  updatePasswordValidator,
  putUserHandler
);

userRouter.get(
  "/getUser/:userId",
  authMiddleware,
  checkRol(["Client", "Admin"]),
  getUserHandler
);

export default userRouter;
