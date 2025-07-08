import { Router } from "express";
import { postMembershipHandler } from "../handlers/postMembershipHandler.js";
import { postMembershipPlanHandler } from "../handlers/postMembershipPlanHandler.js";
import { getMembershipPlansHandler } from "../handlers/getMembershipPlansHandler.js";
import { putMembershipPlanHandler } from "../handlers/putMembershipPlanHandler.js";
import { deleteMembershipPlanHandler } from "../handlers/deleteMembershipPlanHandler.js";
import { getUserMembershipsHandler } from "../handlers/getUserMembershipHandler.js";
import { cancelMembershipHandler } from "../handlers/cancelMembershipHandler.js";
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

routerMembership.put(
  "/membership-plans/:planId",
  authMiddleware,
  checkRol(["Admin"]),
  putMembershipPlanHandler
);

routerMembership.delete(
  "/membership-plans/:planId",
  authMiddleware,
  checkRol(["Admin"]),
  deleteMembershipPlanHandler
);

routerMembership.get(
  "/my-memberships",
  authMiddleware,
  checkRol(["Client", "Admin"]),
  getUserMembershipsHandler
);

routerMembership.delete(
  "/memberships/:membershipId",
  authMiddleware,
  checkRol(["Client", "Admin"]),
  cancelMembershipHandler
);

export default routerMembership;
