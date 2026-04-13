import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const isDevelopment = env.NODE_ENV !== "production";

export const apiRateLimit = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: isDevelopment ? Math.max(env.API_RATE_LIMIT_MAX, 1000) : env.API_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
  skip: (req) => isDevelopment && req.path.startsWith("/api/auth/")
});

export const iotIngressRateLimit = rateLimit({
  windowMs: env.IOT_RATE_LIMIT_WINDOW_MS,
  max: env.IOT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "IoT ingestion rate exceeded" }
});
