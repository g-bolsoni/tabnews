import database from "infra/database";
import { InternalServerError } from "infra/error";

const status = async (req, res) => {
  try {
    const updatedAt = new Date().toISOString();

    const versionDatabase = await database.query("SHOW server_version;");
    const versionDatabaseValue = versionDatabase.rows[0].server_version;

    const databaseMaxConnectionsResult = await database.query(
      "SHOW max_connections;",
    );
    const databaseMaxConnectionsValue =
      databaseMaxConnectionsResult.rows[0].max_connections;

    const DATABASE_NAME = process.env.POSTGRES_DB;

    const databaseOpenedConnections = await database.query({
      text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [DATABASE_NAME],
    });

    const databaseOpenedConnectionsValue =
      databaseOpenedConnections.rows[0].count;

    res.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: versionDatabaseValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
          open_connections: databaseOpenedConnectionsValue,
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\n Erro no catch, controller ");

    res.status(500).json(publicErrorObject);
  }
};

export default status;
