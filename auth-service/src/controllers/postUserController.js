import axios from "axios";
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";
const { encrypt } = handlePassword;
import { tokenSign } from "../middlewares/handleJsonWebToken.js";

const postUserController = async (req, res) => {
  const User = getUserModel();
  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await encrypt(password);
    const userRole = email === process.env.MAIL_ADMIN ? "Admin" : defaultRole;

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roles: [userRole],
    });
    await newUser.save();
    const token = await tokenSign(newUser);
    const usersServiceApiUrl = process.env.USERS_SERVICE_API_URL;

    const profileData = {
      userId: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: req.body.phone,
    };

    try {
      const response = await axios.post(usersServiceApiUrl, profileData);
      console.log("User profile created in users-service:", response.data);
      res.status(201).json({ user: newUser, token });
    } catch (error) {
      console.error("Error calling users-service API:", error.message);
      console.error("Attempting to rollback user creation...");
      try {
        await User.deleteOne({ _id: newUser._id });
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);

        return res.status(500).json({
          message:
            "Error creating user profile. Rollback failed.  Please contact support.",
          error: error.message,
        });
      }
      return res.status(500).json({
        message: "Error creating user profile. User creation rolled back.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export default postUserController;
