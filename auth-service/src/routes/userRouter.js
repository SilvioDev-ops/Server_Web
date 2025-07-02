import express from "express";
import { postUserHandler } from "../handlers/postUserHandler.js";
import { localLoginHandler } from "../handlers/localLoginHandler.js";
import { putUserHandler } from "../handlers/putUserHandler.js";
import { getUserHandler } from "../handlers/getUserHandler.js";
import { authMiddleware } from "../middlewares/authenticateToken.js";
import { registerValidator } from "../validators/registerValidator.js";
import { loginValidator } from "../validators/loginValidator.js";
import { updatePasswordValidator } from "../validators/updatePasswordValidator.js";
import { forgotPasswordHandler } from "../handlers/forgotPasswordHandler.js";
import { resetPasswordHandler } from "../handlers/resetPasswordHandler.js";
import { resetPasswordValidator } from "../validators/resetPasswordValidator.js";
import { verifyEmailHandler } from "../handlers/verifyEmailHandler.js";
import { refreshTokenHandler } from "../handlers/refreshTokenHandler.js";
import { refreshTokenValidator } from "../validators/refreshTokenValidator.js";
import { getAllUsersHandler } from "../handlers/getAllUsersHandler.js";
import { updateUserStatusHandler } from "../handlers/updateUserStatusHandler.js";
import { updateUserStatusValidator } from "../validators/updateUserStatusValidator.js";
import { forgotPasswordValidation } from "../validators/forgotPasswordValidation.js";
import { verifyEmailValidation } from "../validators/verifyEmailValidation.js";
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

userRouter.post(
  "/reset-password",
  resetPasswordValidator,
  resetPasswordHandler
);

userRouter.post(
  "/forgot-password",
  forgotPasswordValidation,
  forgotPasswordHandler
);

userRouter.get("/verify-email", verifyEmailValidation, verifyEmailHandler);

userRouter.post("/refresh-token", refreshTokenValidator, refreshTokenHandler);

userRouter.get(
  "/getAllUsers",
  authMiddleware,
  checkRol(["Admin"]),
  getAllUsersHandler
);

userRouter.post(
  "/updateUserStatus/:userId",
  authMiddleware,
  checkRol(["Admin"]),
  updateUserStatusValidator,
  updateUserStatusHandler
);

export default userRouter;
