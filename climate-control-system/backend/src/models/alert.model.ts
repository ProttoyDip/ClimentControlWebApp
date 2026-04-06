import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export interface Alert {
  id: number;
  device_id: number;
  type: "warning" | "error";
  message: string;
  payload_json: string | null;
  created_at: string;
}

export async function createAlert(payload: {
  deviceId: number;
  type: "warning" | "error";
  message: string;
  data?: Record<string, unknown>;
}) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO alerts (device_id, type, message, payload_json) VALUES (?, ?, ?, ?)`,
    [payload.deviceId, payload.type, payload.message, JSON.stringify(payload.data || {})]
  );

  return result.insertId;
}

export async function listAlerts(limit = 100) {
  const [rows] = await pool.execute<(Alert & RowDataPacket)[]>(
    `SELECT id, device_id, type, message, payload_json, created_at
     FROM alerts
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  );

  return rows;
}
