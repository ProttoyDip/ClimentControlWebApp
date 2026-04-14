import { createServer } from "node:http";
import { createApp } from "./app";
import { checkDatabaseConnection } from "./config/db";
import { env } from "./config/env";
import { startDevicePoller } from "./services/devicePoller.service";
import { startMqttClient } from "./services/mqtt.service";
import { createSocketServer } from "./socket";
import { logger } from "./utils/logger";

async function bootstrap() {
  await checkDatabaseConnection();

  const app = createApp();
  const httpServer = createServer(app);

  createSocketServer(httpServer);
  startMqttClient();
  startDevicePoller();

  httpServer.listen(env.PORT, () => {
    logger("info", `Backend started on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  const err = error as { message?: string; code?: string; stack?: string };
  logger("error", "Failed to bootstrap backend", {
    error: err.message || "Unknown",
    code: err.code,
    stack: err.stack
  });
  process.exit(1);
});
