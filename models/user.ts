import database from "infra/database";
import { NotFoundError, ValidationError } from "infra/error";
import password from "./password";
import { error } from "console";

interface IUserInputValues {
  id?: string;
  username: string;
  email: string;
  password: string;
}

interface IUserUpdateValues {
  username?: string;
  email?: string;
  password?: string;
}

const create = async (userInputValue: IUserInputValues) => {
  await validateUnicUsername(userInputValue.username);
  await validateUnicEmail(userInputValue.email);
  await hashPasswordInObject(userInputValue);

  const newUser = await runInsertQuery(userInputValue);
  return newUser;

  async function runInsertQuery({
    username,
    email,
    password,
  }: IUserInputValues) {
    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
        ;`,

      values: [username, email, password],
    });

    return results.rows[0];
  }
};

const findOneByUsername = async (username: string) => {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,

      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está digitado corretamente.",
        cause: "O username informado não foi encontrado no sistema",
      });
    }

    return results.rows[0];
  }
};

const findOneByEmail = async (email: string) => {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email: string) {
    const results = await database.query({
      text: `
        SELECT
          *
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT
          1
        ;`,

      values: [email],
    });

    if (results.rowCount === 0) {
      throw new Error("O email informado não foi encontrado no sistema");
    }

    return results.rows[0];
  }
};

const update = async (username: string, userInputValues: IUserUpdateValues) => {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    await validateUnicUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUnicEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;
};

const runUpdateQuery = async (userWithNewValues: IUserInputValues) => {
  const results = await database.query({
    text: `
          UPDATE
            users
          SET
            username = $2,
            email = $3,
            password = $4,
            updated_at = timezone('utc', now())
          WHERE
            id = $1
          RETURNING
            *
        `,
    values: [
      userWithNewValues.id,
      userWithNewValues.username,
      userWithNewValues.email,
      userWithNewValues.password,
    ],
  });

  return results.rows[0];
};

async function validateUnicUsername(username: string) {
  const results = await database.query({
    text: `
        SELECT
          username
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        ;`,

    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar esta operação",
      cause: "O username informado já está sendo utilizado.",
    });
  }
}

async function validateUnicEmail(email: string) {
  const results = await database.query({
    text: `
        SELECT
          email
        FROM
          users
        WHERE
          LOWER(email) = LOWER($1)
        ;`,

    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar esta operação.",
      cause: "O email informado já está sendo utilizado.",
    });
  }
}

async function hashPasswordInObject(
  userInputValues: IUserInputValues | IUserUpdateValues,
) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  update,
};

export default user;
