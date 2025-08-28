import bcryptjs from "bcrypt";

const hash = async (password: string) => {
  const rounds = process.env.NODE_ENV == "production" ? 14 : 1;
  return await bcryptjs.hash(password, rounds);
};

const compare = async (providedPassword: string, storedPassword: string) => {
  return await bcryptjs.compare(providedPassword, storedPassword);
};

const password = {
  hash,
  compare,
};

export default password;
