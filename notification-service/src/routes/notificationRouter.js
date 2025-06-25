import express from "express";
import { sendResetPasswordEmailHandler } from "../handlers/sendResetPasswordEmailHandler.js";

const notificationRouter = express.Router();

notificationRouter.post("/forgot-password", sendResetPasswordEmailHandler);

export default notificationRouter;
