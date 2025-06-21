import { createRouter } from "next-connect";
import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { resolve } from "path";
import { Client } from "pg";
import controller from "infra/controller";

interface IDefaultObjectMigration {
  dbClient: Client;
  dryRun: boolean;
  dir: string;
  direction: "up" | "down";
  verbose: boolean;
  migrationsTable: string;
}

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.onErrorHandlers);

const defaulObjectMigrationsRunner: IDefaultObjectMigration = {
  dbClient: null,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: false,
  migrationsTable: "pgmigrations",
};

async function getHandler(req, res) {
  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaulObjectMigrationsRunner,
      dbClient,
    });

    return res.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(req, res) {
  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaulObjectMigrationsRunner,
      dryRun: false,
      dbClient,
    });

    if (migratedMigrations.length > 0) {
      return res.status(201).json(migratedMigrations);
    }

    return res.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}
