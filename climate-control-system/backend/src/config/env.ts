import { config } from "dotenv";
import path from "node:path";
import { z } from "zod";

function parseBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off", ""].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

// Load backend-local .env first, then allow root .env as a fallback for workspace scripts.
config({ path: path.resolve(__dirname, "../../.env") });
config({ path: path.resolve(__dirname, "../../../.env"), override: false });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  APP_URL: z.string().default("http://localhost:5173"),

  MYSQL_HOST: z.string(),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  SOCKET_CORS_ORIGIN: z.string().default("http://localhost:5173"),
  API_CORS_ORIGIN: z.string().default("http://localhost:5173"),

  API_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  API_RATE_LIMIT_MAX: z.coerce.number().default(180),
  IOT_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  IOT_RATE_LIMIT_MAX: z.coerce.number().default(240),

  SENSOR_TEMP_ALERT_MAX: z.coerce.number().default(30),
  SENSOR_HUMIDITY_ALERT_MIN: z.coerce.number().default(35),

  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce.number().default(20),
  PASSWORD_RESET_COOLDOWN_SECONDS: z.coerce.number().default(60),
  SMTP_HOST: z.string().trim().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.preprocess((value) => parseBoolean(value, false), z.boolean()).default(false),
  SMTP_USER: z.string().trim().default(""),
  SMTP_PASS: z.preprocess(
    (value) => (typeof value === "string" ? value.replace(/\s+/g, "") : value),
    z.string().default("")
  ),
  SMTP_FROM: z.string().trim().email().default("no-reply@climate.local"),

  MQTT_ENABLED: z.preprocess((value) => parseBoolean(value, false), z.boolean()).default(false),
  MQTT_URL: z.string().default("mqtt://localhost:1883"),
  MQTT_SENSOR_TOPIC: z.string().default("climate/sensor/data"),
  MQTT_DEVICE_CONTROL_TOPIC_PREFIX: z.string().default("climate/device/control"),
  MQTT_USERNAME: z.string().optional(),
  MQTT_PASSWORD: z.string().optional(),

  DEVICE_API_KEYS: z.string().default("")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
