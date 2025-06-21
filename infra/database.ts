import { Client } from "pg";
import { ServiceError } from "./error";

const query = async (queryObject) => {
  let client: Client;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      cause: error,
      message: "Erro na conxão com o Banco ou na Query",
    });
    throw serviceErrorObject;
  } finally {
    client?.end();
  }
};

const getNewClient = async () => {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV == "production" ? true : false,
  });

  await client.connect();
  return client;
};

const database = {
  query,
  getNewClient,
};

export default database;
