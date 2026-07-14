import mail from "./mail";
import {IUser} from "../interfaces/InterfaceTables";
import { EXPIRATION_IN_MILLISECONDS } from "../constants";
import database from "./database";
import webserver from "./webserver";
import {NotFoundError} from "./error";

const sendEmailToUser = async (user: IUser, activationToken) => {

  await mail.sendMail({
    from: "GBNews <contato@gbnews.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no GbNews!",
    text:`${user.username}, clique no link abaixo para ativar seu cadastro no GbNews.
${webserver.origin}/cadastro/ativar/${activationToken.id}.
  `
  })
}

const create = async (id: Pick<IUser, "id">) => {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const user_id = id
  const results = await database.query({
    text: `INSERT INTO user_activation_tokens (user_id, expires_at) VALUES ($1, $2) RETURNING *;`,
    values: [user_id , expiresAt],
  })

  return results.rows[0];
}

const findOneValidById = async (tokenId) => {
  const results = await database.query({
    text: `SELECT * FROM user_activation_tokens
          WHERE
              id = $1
              AND expires_at > NOW()
              AND used_at IS NULL
          LIMIT 1`,
    values: [tokenId]
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "O token de ativação utilizado não foi encontrado no sistema ou exiprou.",
      action: "Faça um novo cadastro.",
      cause: "O token de ativação utilizado não foi encontrado no sistema ou exiprou.",
    });
  }

  return results.rows[0];
}

const activation = {
  sendEmailToUser,
  create,
  findOneValidById
}


export default activation;