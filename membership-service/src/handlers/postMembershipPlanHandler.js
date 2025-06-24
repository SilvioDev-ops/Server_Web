import { postMembershipPlanController} from "../controllers/postMembershipPlanCotroller.js";

  export const postMembershipPlanHandler = async (req, res) => {
    try {
        const savedPlan = await postMembershipPlanController(req);

        res.status(201).json(savedPlan);
    } catch (error) {
        console.error("Error creating membership plan:", error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        if (error.message.includes("Missing required fields") ||
            error.message.includes("Price cannot be negative") ||
            error.message.includes("Duration value must be at least 1")) {
            return res.status(400).json({ message: error.message });
        }
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            return res.status(409).json({ message: "A membership plan with this name already exists." });
        }

        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

