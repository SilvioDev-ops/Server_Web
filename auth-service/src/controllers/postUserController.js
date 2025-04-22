import { getUserModel } from "../getModel.js"; // Ajusta la ruta
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

    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await newUser.save();

    const token = await tokenSign(newUser);

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default postUserController;
