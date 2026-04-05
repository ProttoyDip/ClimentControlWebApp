import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export interface SensorData {
  id: number;
  device_id: number;
  temperature: number;
  humidity: number;
  fan_status: "on" | "off";
  ac_status: "on" | "off";
  recorded_at: string;
}

export async function insertSensorReading(payload: {
  deviceId: number;
  temperature: number;
  humidity: number;
  fanStatus: "on" | "off";
  acStatus: "on" | "off";
  recordedAt?: string;
}) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO sensor_data (device_id, temperature, humidity, fan_status, ac_status, recorded_at)
     VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
    [
      payload.deviceId,
      payload.temperature,
      payload.humidity,
      payload.fanStatus,
      payload.acStatus,
      payload.recordedAt ?? null
    ]
  );

  return result.insertId;
}

export async function getLatestReadings(limit = 50) {
  const [rows] = await pool.execute<(SensorData & RowDataPacket)[]>(
    `SELECT id, device_id, temperature, humidity, fan_status, ac_status, recorded_at
     FROM sensor_data
     ORDER BY recorded_at DESC
     LIMIT ?`,
    [limit]
  );

  return rows;
}

export async function getReadingsByDevice(deviceId: number, limit = 200) {
  const [rows] = await pool.execute<(SensorData & RowDataPacket)[]>(
    `SELECT id, device_id, temperature, humidity, fan_status, ac_status, recorded_at
     FROM sensor_data
     WHERE device_id = ?
     ORDER BY recorded_at DESC
     LIMIT ?`,
    [deviceId, limit]
  );

  return rows;
}
