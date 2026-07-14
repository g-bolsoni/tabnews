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

const mailHttpUrl = `http://${process.env.MAIL_HTTP_HOST}:${process.env.MAIL_HTTP_PORT}`;

const waitForAllServices = async () => {
  await waitForWebServer();
  await waitForEmailServer();

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

  async function waitForEmailServer() {
    return retry(fetchMailPage, {
      retries: 100,
      maxTimeout: 2000,
    });

    async function fetchMailPage() {
      const response = await fetch(mailHttpUrl);

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

const createUser = async (
  userObject: CreateUserObject | null,
): Promise<IUser> => {
  return await user.create({
    username: userObject?.username ?? faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject?.email ?? faker.internet.email(),
    password: userObject?.password ?? faker.internet.password(),
  });
};

const createSession = async (userId: string) => {
  return await session.create(userId);
};

const clearAllMails = async () => {
  await fetch(`${mailHttpUrl}/messages`, {
    method: "DELETE",
  });
};
const getLastMail = async () => {
  const mailListResponse = await fetch(`${mailHttpUrl}/messages`);
  const mailListBody = await mailListResponse.json();
  const lastMailItem = mailListBody.pop();
  if (!lastMailItem) return null;

  const textResponse = await fetch(
    `${mailHttpUrl}/messages/${lastMailItem.id}.plain`,
    {},
  );
  const mailTextBody = await textResponse.text();

  return { ...lastMailItem, text: mailTextBody };
};

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  clearAllMails,
  getLastMail,
};

export default orchestrator;
