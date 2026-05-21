import crypto from "node:crypto";
import database from "infra/database";
import { EXPIRATION_IN_MILLISECONDS } from "../constants";

const create = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");

  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const sessionResult = await database.query({
    text: `
      INSERT INTO
        sessions (token, user_id, expires_at)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,

    values: [token, userId, expiresAt],
  });

  return sessionResult.rows[0];
};

const findByToken = async (token: string) => {
  if (!token) throw new Error("Token is required");

  const sessionResult = await database.query({
    text: `
      SELECT
        *
      FROM
        sessions
      WHERE
        token = $1
        AND expires_at > NOW()
      LIMIT 1
      ;`,
    values: [token],
  });

  return sessionResult.rows[0];
}

const session = { create, findByToken };

export default session;
