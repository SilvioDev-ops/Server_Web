import { Router } from "express";
import routerMembership from "./memberShipRoutes.js";

const router = Router();

router.use("/memberships", routerMembership);

export default router;
