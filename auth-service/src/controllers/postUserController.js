import axios from "axios";
import { getUserModel } from "../getModel.js";
import handlePassword from "../utils/handlePassword.js";
const { encrypt } = handlePassword;
import { tokenSign } from "../middlewares/handleJsonWebToken.js";

const postUserController = async (req, res) => {
  const User = getUserModel();
  const defaultRole = "Client";

  const {
    email,
    password,
    firstName,
    lastName,
    nombre,
    apellido,
    phone,
    phoneNumber,
    telefono,
  } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const finalFirstName = firstName || nombre;
    const finalLastName = lastName || apellido;
    const finalPhone = phone || phoneNumber || telefono;

    if (!finalFirstName || !finalLastName) {
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await encrypt(password);
    const userRole = email === process.env.MAIL_ADMIN ? "Admin" : defaultRole;

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName: finalFirstName,
      lastName: finalLastName,
      roles: [userRole],
    });

    await newUser.save();

    const token = await tokenSign(newUser);

    const usersServiceApiUrl = process.env.USERS_SERVICE_API_URL;

    if (!usersServiceApiUrl) {
      await User.deleteOne({ _id: newUser._id });

      return res.status(500).json({
        message: "USERS_SERVICE_API_URL is not defined",
      });
    }

    const profileData = {
      userId: newUser._id.toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: finalPhone,
    };

    try {
      const response = await axios.post(usersServiceApiUrl, profileData);

      console.log("User profile created in users-service:", response.data);

      return res.status(201).json({
        user: newUser,
        token,
      });
    } catch (error) {
      console.error("Error calling users-service API:");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("Message:", error.message);

      await User.deleteOne({ _id: newUser._id });

      return res.status(500).json({
        message: "Error creating user profile. User creation rolled back.",
        error: error.response?.data || error.message,
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default postUserController;
