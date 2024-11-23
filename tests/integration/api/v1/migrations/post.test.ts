import database from "infra/database";

const cleanDatabase = async () => {
  await database.query("drop schema public cascade; create schema public;");
};

beforeAll(cleanDatabase);
test("Post to /api/v1/migrations should return 200", async () => {
  // post 1
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  expect(response.status).toBe(201);

  const responseBody = await response.json();
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);

  // Post 2
  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  expect(response2.status).toBe(200);

  const responseBody2 = await response2.json();
  expect(Array.isArray(responseBody2)).toBe(true);
  expect(responseBody2.length).toBe(0);
});

test("Delete to /api/v1/migrations should return 405 and should keep open_connections as 1", async () => {
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
