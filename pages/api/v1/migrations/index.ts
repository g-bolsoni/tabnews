import { createRouter } from "next-connect";
import database from "infra/database";
import migrationRunner from "node-pg-migrate";
import { resolve } from "path";
import { Client } from "pg";
import { InternalServerError, MethodNotAllowedError } from "infra/error";

interface IDefaultObjectMigration {
  dbClient: Client;
  dryRun: boolean;
  dir: string;
  direction: "up" | "down";
  verbose: boolean;
  migrationsTable: string;
}

const router = createRouter();

router.get(migrations).post(migrations);

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

function onErrorHandler(error, req, res) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\n Erro dentro do catch do arquivo /status  ");

  res.status(500).json(publicErrorObject);
}

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowedError();
  res.status(publicErrorObject.status_code).json(publicErrorObject);
}

async function migrations(req, res) {
  const acceptedMethods = ["GET", "POST"];

  if (!acceptedMethods.includes(req.method)) {
    return res.status(405).json({
      error: `Method ${req.method} not allowed.`,
    });
  }

  let dbClient: Client;

  try {
    dbClient = await database.getNewClient();

    const defaulObjectMigrationsRunner: IDefaultObjectMigration = {
      dbClient: dbClient,
      dryRun: true,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: false,
      migrationsTable: "pgmigrations",
    };

    if (req.method == "GET") {
      const pendingMigrations = await migrationRunner(
        defaulObjectMigrationsRunner,
      );

      return res.status(200).json(pendingMigrations);
    }

    if (req.method == "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaulObjectMigrationsRunner,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return res.status(201).json(migratedMigrations);
      }

      return res.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
