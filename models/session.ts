import crypto from "node:crypto";
import database from "infra/database";
import { EXPIRATION_IN_MILLISECONDS } from "../constants";
import { UnauthorizedError } from "infra/error";

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

  if (sessionResult.rowCount === 0) {
    throw new UnauthorizedError({
      message: "Usuário não possui sessão ativa",
      action: "Verifique se este usuário está logado e tente novamente.",
    });
  }
  return sessionResult.rows[0];
};

const renew = async (sessionId: string) => {
  const newExpiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const result = await database.query({
    text: `
      UPDATE
        sessions
      SET
        expires_at = $2,
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING *;
    `,
    values: [sessionId, newExpiresAt],
  });

  return result.rows[0];
};

const expireByID = async (sessionId: string) => {
  const result = await database.query({
    text: `
      UPDATE
        sessions
      SET
        expires_at = expires_at - interval '1 year',
        updated_at = NOW()
      WHERE
        id = $1
      RETURNING *;
    `,
    values: [sessionId],
  });

  return result.rows[0];
};

const session = { create, findByToken, renew, expireByID };

export default session;
