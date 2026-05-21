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
      const { id, email, password, created_at, updated_at } = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const { token } = await orchestrator.createSession(id);

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
        created_at: created_at.toISOString(),
        updated_at: updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

    });

  });
});
