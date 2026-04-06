import morgan from "morgan";
import { createLogger, format, transports } from "winston";
import { env } from "../config/env";

type LogLevel = "error" | "warn" | "info";

export const appLogger = createLogger({
  level: env.LOG_LEVEL,
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [new transports.Console()]
});

export function logger(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  appLogger.log(level, message, meta || {});
}

export const httpLogger = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (line) => appLogger.http(line.trim())
    }
  }
);
