import mail from "./mail";
import {IUser} from "../interfaces/InterfaceTables";
import { EXPIRATION_IN_MILLISECONDS } from "../constants";
import database from "./database";
import webserver from "./webserver";

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

const findByUserId = async (id: string) => {
  const results = await database.query({
    text: `SELECT * FROM user_activation_tokens WHERE user_id = $1 LIMIT 1`,
    values: [id]
  });

  return results.rows[0];
}

const activation = {
  sendEmailToUser,
  create,
  findByUserId
}


export default activation;