import {Router} from 'express';
import {postMembershipHandler} from '../handlers/postMembershipHandler.js';
import {getAllMembershipHandler}  from "../handlers/getAllMembershipHandler.js";
import{postMembershipPlanHandler} from "../handlers/postMembershipPlanHandler.js";
import {authMiddleware} from "../middlewares/authenticateToken.js";
import { checkRol } from '../utils/checkRol.js';

const routerMembership = Router();

routerMembership.post('/memberships', authMiddleware, checkRol(['Client']), postMembershipHandler);
routerMembership.get('/memberships', authMiddleware, checkRol(['Admin']), getAllMembershipHandler);
routerMembership.post('/membership-plans', authMiddleware, checkRol(['Admin']), postMembershipPlanHandler);

export default routerMembership;