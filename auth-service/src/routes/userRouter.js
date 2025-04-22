import express from "express";
const userRouter = express.Router();

// IMPORTS
import { postUserHandler } from "../handlers/postUserHandler.js";
import { localLoginHandler } from "../handlers/localLoginHandler.js";
userRouter.post("/register", postUserHandler);
userRouter.post("/login", localLoginHandler);
export default userRouter;
