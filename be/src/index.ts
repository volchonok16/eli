import { createApp } from "./app.js";
import { config, assertProductionSecrets } from "./config.js";
import { prisma } from "./db/prisma.js";
import { initMinio } from "./services/minio.js";
import { startOrderExpiryScheduler } from "./services/reservation.js";

async function main() {
  assertProductionSecrets();

  await prisma.$connect();
  await initMinio();
  startOrderExpiryScheduler();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API запущен: http://localhost:${config.port}`);
  });
}

main().catch((error) => {
  console.error("Ошибка запуска:", error);
  process.exit(1);
});
