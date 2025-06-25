import { Router } from "express";
import notificationRouter from "./notificationRouter.js";
const router = Router();

router.use("/notification", notificationRouter);

export default router;
