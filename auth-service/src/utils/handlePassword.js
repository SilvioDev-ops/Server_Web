import bcrypt from "bcryptjs";

const { hash: _hash, compare: _compare } = bcrypt;

const encrypt = async (passwordplain) => {
  const hash = await _hash(passwordplain, 10);
  return hash;
};

const compare = async (passwordplain, hashPassword) => {
  return await _compare(passwordplain, hashPassword);
};

export default { encrypt, compare };
