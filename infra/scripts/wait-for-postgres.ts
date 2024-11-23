const { exec } = require("node:child_process");
const checkPostgres = () => {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }
    console.log("\n\n\n 🟢 Postgres está pronto e aceitando conexões");
  }
};

process.stdout.write("\n\n 🔴 Aguardando postgres aceitar conexões ");

checkPostgres();
