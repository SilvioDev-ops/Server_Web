import { Router } from "express";
import userProfileRouter from "./userProfileRouter.js";

const router = Router();

router.use("/userProfile", userProfileRouter);

export default router;
