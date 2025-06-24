import { validationResult } from "express-validator";
import { putUserController } from "../controllers/putUserController.js";
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";

export const putUserHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const User = getUserModel();

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await handlePassword.compare(
      oldPassword,
      userToUpdate.password
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid old password." });
    }

    const hashedNewPassword = await handlePassword.encrypt(newPassword);

    const userDataToUpdate = { password: hashedNewPassword };

    const updatedUser = await putUserController(userId, userDataToUpdate);

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating user password in handler:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
};
