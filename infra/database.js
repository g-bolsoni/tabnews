import { Client, Pool } from "pg";

const query = async (queryObject) => {
  const pool = new Pool({});

  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV == 'development' ? false : true
  });

  try {
    await client.connect();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    console.error(err);
    throw error;
  } finally {
    client.end();
  }
};

export default {
  query: query,
};
