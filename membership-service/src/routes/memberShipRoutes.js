import { Router } from "express";
import { postMembershipHandler } from "../handlers/postMembershipHandler.js";
import { postMembershipPlanHandler } from "../handlers/postMembershipPlanHandler.js";
import { getMembershipPlansHandler } from "../handlers/getMembershipPlansHandler.js";
import { authMiddleware } from "../middlewares/authenticateToken.js";
import { checkRol } from "../utils/checkRol.js";

const routerMembership = Router();

routerMembership.post(
  "/memberships",
  authMiddleware,
  checkRol(["Client"]),
  postMembershipHandler
);
routerMembership.post(
  "/membership-plans",
  authMiddleware,
  checkRol(["Admin"]),
  postMembershipPlanHandler
);

routerMembership.get(
  "/membership-plans",
  authMiddleware,
  checkRol(["Client", "Admin"]),
  getMembershipPlansHandler
);

export default routerMembership;
