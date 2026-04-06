import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const apiRateLimit = rateLimit({
  windowMs: env.API_RATE_LIMIT_WINDOW_MS,
  max: env.API_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

export const iotIngressRateLimit = rateLimit({
  windowMs: env.IOT_RATE_LIMIT_WINDOW_MS,
  max: env.IOT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "IoT ingestion rate exceeded" }
});
