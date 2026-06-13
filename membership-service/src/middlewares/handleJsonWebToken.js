import pkg from "jsonwebtoken";
const { sign: _sign, verify } = pkg;
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const tokenSign = async (user) => {
  const sign = _sign(
    {
      id: user.id,
      type: user.type,
    },
    JWT_SECRET,
    {
      expiresIn: "3h",
    }
  );
  return sign;
};

export const verifyToken = async (tokenJwt) => {
  try {
    return verify(tokenJwt, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
