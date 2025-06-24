import migrationRunner from "node-pg-migrate";
import database from "infra/database";
import { resolve } from "path";
import { Client } from "pg";

interface IDefaultObjectMigration {
  dbClient: Client;
  dryRun: boolean;
  dir: string;
  direction: "up" | "down";
  verbose: boolean;
  migrationsTable: string;
}

const defaulObjectMigrationsRunner: IDefaultObjectMigration = {
  dbClient: null,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: false,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaulObjectMigrationsRunner,
      dbClient,
    });

    return pendingMigrations;
  } finally {
    await dbClient.end();
  }
}

async function runPendingMigrations() {
  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaulObjectMigrationsRunner,
      dryRun: false,
      dbClient,
    });

    return migratedMigrations;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
