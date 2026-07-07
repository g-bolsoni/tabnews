import session from "models/session";
import { EXPIRATION_IN_MILLISECONDS } from "../../../../../constants";
import setCookieParser from "set-cookie-parser";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users", () => {
  describe("Default user", () => {
    test("With valid valid session", async () => {
      const { id, email, password, created_at, updated_at } =
        await orchestrator.createUser({
          username: "UserWithValidSession",
        });

      const {
        token,
        expires_at: original_expires,
        updated_at: original_updated,
      } = await orchestrator.createSession(id);

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "GET",
        headers: {
          Cookie: `session_id=${token}`,
        },
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: id,
        username: "UserWithValidSession",
        email: email,
        password: password,
        features: ['read:activation_token'],
        created_at: created_at.toISOString(),
        updated_at: updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session renewal assertions

      const { expires_at: new_expires, updated_at: new_updated } =
        await session.findByToken(token);

      expect(new_expires > original_expires).toEqual(true);
      expect(new_updated > original_updated).toEqual(true);

      // Set-cookies assertions
      // @ts-ignore
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: token,
        maxAge: EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent session", async () => {
      const nonexistentToken =
        "e0445deaffba26c95fff5e5c3ae0e00bfe8a1ed548ca31fa45d04aac7972f2d1fcacf33cf94fe596c4be2868e17f26fe";

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "GET",
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });

      // Set-Cookie assertions
      // @ts-ignore
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - EXPIRATION_IN_MILLISECONDS),
      });

      const { id } = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const { token } = await orchestrator.createSession(id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "GET",
        headers: {
          Cookie: `session_id=${token}`,
        },
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa",
        action: "Verifique se este usuário está logado e tente novamente.",
        status_code: 401,
      });

      // Set-Cookie assertions
      // @ts-ignore
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
