import { ResultSetHeader } from "mysql2";
import { pool } from "../config/db";

export async function createLog(payload: {
  level: "info" | "warn" | "error";
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  await pool.execute<ResultSetHeader>(
    `INSERT INTO logs (level, source, message, metadata) VALUES (?, ?, ?, ?)`,
    [payload.level, payload.source, payload.message, JSON.stringify(payload.metadata || {})]
  );
}
