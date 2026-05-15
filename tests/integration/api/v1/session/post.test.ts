import { EXPIRATION_IN_MILLISECONDS } from "../../../../../constants";
import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import setCookieParser from 'set-cookie-parser'

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/session", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "correct-password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrong@example.com",
          password: "correct-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados informados e tente novamente.",
        status_code: 401,
      });
    });

    test("With correct `email` but incorrec `password`", async () => {
      const { email } = await orchestrator.createUser({});
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: "incorrect-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados informados e tente novamente.",
        status_code: 401,
      });
    });

    test("With incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect@email.com",
          password: "incorrect-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique os dados informados e tente novamente.",
        status_code: 401,
      });
    });

    test("With correct `email` and correct `password`", async () => {
      const { email, id } = await orchestrator.createUser({
        password: "correct-password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: "correct-password"
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at)
      const createdAt = new Date(responseBody.created_at)

      expiresAt.setMilliseconds(0)
      createdAt.setMilliseconds(0)

      const datesDiff =  expiresAt.valueOf() - createdAt.valueOf();

      expect(datesDiff).toBe(EXPIRATION_IN_MILLISECONDS)

      const parsedSetCookie = setCookieParser(response, {
        map: true
      })
      expect(parsedSetCookie.session_id).toEqual({
        name: 'session_id',
        value: responseBody.token,
        maxAge: EXPIRATION_IN_MILLISECONDS / 1000,
        path: '/',
        httpOnly: true
      });


    });
  });
});
