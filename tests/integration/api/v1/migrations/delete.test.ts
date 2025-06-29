import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("DELETE /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Should keep open_connections as 1", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "DELETE",
      });

      expect(response.status).toBe(405);

      const responseStatusConnections = await fetch(
        "http://localhost:3000/api/v1/status",
      );

      const connectionsBody = await responseStatusConnections.json();
      const openConnections =
        connectionsBody.dependencies.database.open_connections;

      expect(openConnections).toBeLessThanOrEqual(1);
    });

    test("Should return erro", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "DELETE",
      });

      expect(response.status).toBe(405);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para esse endpoint.",
        action:
          "Verifique se o método HTTP enviado é valido para este endpoint",
        status_code: 405,
      });
    });
  });
});
