import { createRouter } from "next-connect";
import controller from "infra/controller";
import migrator from "models/migrator";

const router = createRouter();

router.get(getHandler).post(postHandler);

export default router.handler(controller.onErrorHandlers);

async function getHandler(req, res) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return res.status(200).json(pendingMigrations);
}

async function postHandler(req, res) {
  const migratedMigrations = await migrator.runPendingMIgrations();

  if (migratedMigrations.length > 0) {
    return res.status(201).json(migratedMigrations);
  }

  return res.status(200).json(migratedMigrations);
}
