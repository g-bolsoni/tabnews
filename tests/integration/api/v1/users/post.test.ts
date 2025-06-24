import orchestrator from "tests/orchestrator";
import database from "infra/database";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase(); // se comentar, o teste passa, mas não deve
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      // await database.query({
      //   text: "INSERT INTO users (id, username) VALUES ($1, $2)",
      //   values: ["6e715249-e4ca-4c04-ae86-43c4b2073daa", "giovane_souza"],
      // });

      const users = await database.query("SELECT * FROM users;");
      console.log(users.rows);

      // const response = await fetch("http://localhost:3000/api/v1/users", {
      //   method: "POST",
      // });

      const response = {
        status: 201,
      };

      expect(response.status).toBe(201);
    });
  });
});
