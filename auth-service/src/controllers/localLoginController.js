import { getUserModel } from "../getModel.js";
import { compare } from "bcryptjs";
import { tokenSign } from "../middlewares/handleJsonWebToken.js";

const localLoginController = async (email, password) => {
  const User = getUserModel();

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }
  const hashPassword = user.password;
  const isMatch = await compare(password, hashPassword);

  if (!isMatch) {
    throw new Error("Invalid password");
  }

  user.password = undefined;

  const data = {
    token: await tokenSign(user),
    user,
  };
  return data;
};

export default localLoginController;
