import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import { apiRateLimit } from "./middlewares/rateLimit.middleware";
import apiRouter from "./routes";
import { httpLogger } from "./utils/logger";

const corsOrigins = env.API_CORS_ORIGIN.split(",").map((item) => item.trim());

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(httpLogger);
  app.use(apiRateLimit);

  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
