import cors from "cors";
import express from "express";
import helmet from "helmet";
import apiRouter from "./routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
