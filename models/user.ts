import database from "infra/database";
import { ValidationError } from "infra/error";

interface IUserInputValues {
  username: string;
  email: string;
  password: string;
}

const create = async (userInputValue: IUserInputValues) => {
  await validateUnicEmail(userInputValue.email);
  await validateUnicUsername(userInputValue.username);

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
        action: "Utilize outro email para realizar o cadastro.",
        cause: "O email informado já está sendo utilizado.",
      });
    }
  }

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
        message: "O nome de usuário informado está sendo utilizado.",
        action: "Utilize outro nome para realizar o cadastro.",
        cause: "O nome de usuário informado está sendo utilizado.",
      });
    }
  }
};

const user = {
  create,
};

export default user;
