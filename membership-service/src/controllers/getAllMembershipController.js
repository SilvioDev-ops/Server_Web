import { getMembershipModel } from "../getModel.js"; 

export const getAllMembershipController = async (req, res) => { 
   
        const Membership = getMembershipModel(); 
        const memberships = await Membership.find(); 
         
        if (!memberships) {
            return res.status(404).json({ message: "No memberships found" }); 
        }
        return memberships
    }