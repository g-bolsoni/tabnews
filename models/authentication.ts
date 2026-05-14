import { NotFoundError, UnauthorizedError } from "infra/error";
import password from "./password";
import user from "./user";
import { User } from "interfaces/InterfaceTables";

const defaultErrorMessages = {
  message: "Dados de autenticação não conferem.",
  action: "Verifique os dados informados e tente novamente.",
}


const getAuthenticatedUser = async (email: string, providePassword: string): Promise<User> => {
  try {
    const storedUser = await findUserByEmail(email);
    await validatePassword(providePassword, storedUser.password);

    return storedUser

  } catch (error) {
    if (error instanceof UnauthorizedError)
      throw new UnauthorizedError(defaultErrorMessages);

    throw error;
  }
};

const findUserByEmail = async (email: string) => {
  let storagedUser: User;

  try {
    storagedUser = await user.findOneByEmail(email);
  } catch (error) {
    if (error instanceof NotFoundError)
      throw new UnauthorizedError(defaultErrorMessages);

    throw error;
  }

  return storagedUser;
};

const validatePassword = async ( providedPassword: string, storedPassword: string ) => {
  const isPasswordValid = await password.compare(
    providedPassword,
    storedPassword,
  );

  if (!isPasswordValid)
    throw new UnauthorizedError(defaultErrorMessages);

  return isPasswordValid;
};

const authentication = {
  getAuthenticatedUser
};

export default authentication;
