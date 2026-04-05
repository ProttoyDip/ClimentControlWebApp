import { createServer } from "node:http";
import { createApp } from "./app";
import { checkDatabaseConnection } from "./config/db";
import { env } from "./config/env";
import { startMqttClient } from "./services/mqtt.service";
import { createSocketServer } from "./socket";
import { logger } from "./utils/logger";

async function bootstrap() {
  await checkDatabaseConnection();

  const app = createApp();
  const httpServer = createServer(app);

  createSocketServer(httpServer);
  startMqttClient();

  httpServer.listen(env.PORT, () => {
    logger("info", `Backend started on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger("error", "Failed to bootstrap backend", {
    error: error instanceof Error ? error.message : "Unknown"
  });
  process.exit(1);
});
