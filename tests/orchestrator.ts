import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";
import { IUser } from "interfaces/InterfaceTables";
import session from "models/session";
interface CreateUserObject {
  username?: string;
  email?: string;
  password?: string;
}

const waitForAllServices = async () => {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 2000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
};

const clearDatabase = async () => {
  await database.query("drop schema public cascade; create schema public;");
};

const runPendingMigrations = async () => {
  await migrator.runPendingMigrations();
};

const createUser = async (userObject: CreateUserObject): Promise<IUser> => {
  return await user.create({
    username: userObject?.username ?? faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email ?? faker.internet.email(),
    password: userObject?.password ?? faker.internet.password(),
  });
};

const createSession = async (userId: string) => {
  return await session.create(userId);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
};

export default orchestrator;
