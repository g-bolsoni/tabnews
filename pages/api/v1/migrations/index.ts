import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { join } from "path";
import { Client } from "pg";

interface IDefaultObjectMigration {
  dbClient: Client;
  dryRun: boolean;
  dir: string;
  direction: "up" | "down";
  verbose: boolean;
  migrationsTable: string;
}

const migrations = async (req, res) => {
  const acceptedMethods = ["GET", "POST"];

  if (!acceptedMethods.includes(req.method)) {
    res.status(405).end();
  }

  const dbClient = await database.getNewClient();

  const defaulObjectMigrationsRunner: IDefaultObjectMigration = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: false,
    migrationsTable: "pgmigrations",
  };

  if (req.method == "GET") {
    const pendingMigrations = await migrationRunner(
      defaulObjectMigrationsRunner,
    );
    await dbClient.end();
    return res.status(200).json(pendingMigrations);
  }

  if (req.method == "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaulObjectMigrationsRunner,
      dryRun: false,
    });

    await dbClient.end();

    if (migratedMigrations.length > 0) {
      return res.status(201).json(migratedMigrations);
    }

    return res.status(200).json(migratedMigrations);
  }
};

export default migrations;
