import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";

type LogLevel = "info" | "warning" | "warn" | "error";

export async function createLog(payload: {
  level: LogLevel;
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const normalizedLevel = payload.level === "warn" ? "warning" : payload.level;

  await pool.execute<ResultSetHeader>(
    `INSERT INTO logs (level, source, message, metadata) VALUES (?, ?, ?, ?)`,
    [normalizedLevel, payload.source, payload.message, JSON.stringify(payload.metadata || {})]
  );
}
