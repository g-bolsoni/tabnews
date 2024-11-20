import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { join } from "path";

const migrations = async (req, res) => {
  if (!req.method == "GET" || !req.method == "POST") {
    res.status(405).end();
  }

  const dbClient = await database.getNewClient();
  const defaulObjectMigrationsRunner = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (req.method == "GET") {
    const pendingMigrations = await migrationRunner(
      defaulObjectMigrationsRunner,
    );
    await dbClient.end();
    res.status(200).json(pendingMigrations);
  }

  if (req.method == "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaulObjectMigrationsRunner,
      dryRun: false,
    });

    await dbClient.end();

    if (migratedMigrations.length > 0) {
      res.status(201).json(migratedMigrations);
    }

    res.status(200).json(migratedMigrations);
  }
};

export default migrations;
