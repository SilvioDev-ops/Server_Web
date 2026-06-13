import { Router } from "express";
import { postMembershipHandler } from "../handlers/postMembershipHandler.js";
import { postMembershipPlanHandler } from "../handlers/postMembershipPlanHandler.js";
import { getMembershipPlansHandler } from "../handlers/getMembershipPlansHandler.js";
import { putMembershipPlanHandler } from "../handlers/putMembershipPlanHandler.js";
import { deleteMembershipPlanHandler } from "../handlers/deleteMembershipPlanHandler.js";
import { getUserMembershipsHandler } from "../handlers/getUserMembershipHandler.js";
import { cancelMembershipHandler } from "../handlers/cancelMembershipHandler.js";
import { getAllMembershipHandler } from "../handlers/getAllMembershipHandler.js";
import { getMembershipHistoryHandler } from "../handlers/getMembershipHistoryHandler.js";
import { renewMembershipHandler } from "../handlers/renewMembershipHandler.js";
import { suspendMembershipHandler } from "../controllers/suspendMembershipHandler.js";
import { authMiddleware } from "../middlewares/authenticateToken.js";
import { checkRol } from "../utils/checkRol.js";

const routerMembership = Router();

routerMembership.post(
  "/memberships",
  authMiddleware,
  checkRol(["Client"]),
<<<<<<< HEAD
  postMembershipHandler,
=======
  postMembershipHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);
routerMembership.post(
  "/membership-plans",
  authMiddleware,
  checkRol(["Admin"]),
<<<<<<< HEAD
  postMembershipPlanHandler,
=======
  postMembershipPlanHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.get(
  "/membership-plans",
  authMiddleware,
  checkRol(["Client", "Admin"]),
<<<<<<< HEAD
  getMembershipPlansHandler,
=======
  getMembershipPlansHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.put(
  "/membership-plans/:planId",
  authMiddleware,
  checkRol(["Admin"]),
<<<<<<< HEAD
  putMembershipPlanHandler,
=======
  putMembershipPlanHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.delete(
  "/membership-plans/:planId",
  authMiddleware,
  checkRol(["Admin"]),
<<<<<<< HEAD
  deleteMembershipPlanHandler,
=======
  deleteMembershipPlanHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.get(
  "/my-memberships",
  authMiddleware,
  checkRol(["Client", "Admin"]),
<<<<<<< HEAD
  getUserMembershipsHandler,
=======
  getUserMembershipsHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.delete(
  "/memberships/:membershipId",
  authMiddleware,
  checkRol(["Client", "Admin"]),
<<<<<<< HEAD
  cancelMembershipHandler,
=======
  cancelMembershipHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.get(
  "/all-memberships",
  authMiddleware,
  checkRol(["Admin"]),
<<<<<<< HEAD
  getAllMembershipHandler,
=======
  getAllMembershipHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.get(
  "/membership-history",
  authMiddleware,
  checkRol(["Client", "Admin"]),
<<<<<<< HEAD
  getMembershipHistoryHandler,
=======
  getMembershipHistoryHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.post(
  "/memberships/:membershipId/renew",
  authMiddleware,
  checkRol(["Client", "Admin"]),
<<<<<<< HEAD
  renewMembershipHandler,
=======
  renewMembershipHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);

routerMembership.put(
  "/memberships/:membershipId/suspend",
  authMiddleware,
  checkRol(["Admin"]),
<<<<<<< HEAD
  suspendMembershipHandler,
=======
  suspendMembershipHandler
>>>>>>> cc7160a3ee5a811f12a3053acc295e6257a26319
);
export default routerMembership;
