import { getAllMembershipController } from "../controllers/getAllMembershipController.js";


export const getAllMembershipHandler = async (req, res) => {
try {
    const memberships = await getAllMembershipController(req, res);
    if (!memberships) {
        return res.status(404).json({ message: "No memberships found" });
    }
    res.status(200).json(memberships);
    
} catch (error) {
    console.error("Error in getAllMembershipHandler:", error);
    res.status(500).json({ message: "Internal server error" });
    
}  };
   