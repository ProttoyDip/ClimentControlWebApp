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
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.trunc(limit), 1), 500) : 50;
  const [rows] = await pool.execute<(SensorData & RowDataPacket)[]>(
    `SELECT id, device_id, temperature, humidity, fan_status, ac_status, recorded_at
     FROM sensor_data
     ORDER BY recorded_at DESC
     LIMIT ${safeLimit}`
  );

  return rows;
}

export async function getReadingsByDevice(deviceId: number, limit = 200) {
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.trunc(limit), 1), 500) : 200;
  const [rows] = await pool.execute<(SensorData & RowDataPacket)[]>(
    `SELECT id, device_id, temperature, humidity, fan_status, ac_status, recorded_at
     FROM sensor_data
     WHERE device_id = ?
     ORDER BY recorded_at DESC
     LIMIT ${safeLimit}`,
    [deviceId]
  );

  return rows;
}

export async function getReadingsSince(hoursBack = 24) {
  const [rows] = await pool.execute<(SensorData & RowDataPacket)[]>(
    `SELECT id, device_id, temperature, humidity, fan_status, ac_status, recorded_at
     FROM sensor_data
     WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
     ORDER BY recorded_at ASC`,
    [hoursBack]
  );

  return rows;
}

export async function getTrendBuckets(period: "day" | "week" | "month") {
  const hoursBack = period === "day" ? 24 : period === "week" ? 24 * 7 : 24 * 30;
  const bucketExpression =
    period === "day"
      ? `DATE_FORMAT(recorded_at, '%Y-%m-%d %H:00:00')`
      : `DATE_FORMAT(recorded_at, '%Y-%m-%d')`;

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT ${bucketExpression} AS bucket,
            AVG(temperature) AS avg_temperature,
            AVG(humidity) AS avg_humidity,
            SUM(CASE WHEN fan_status = 'on' THEN 1 ELSE 0 END) AS fan_on_count,
            SUM(CASE WHEN ac_status = 'on' THEN 1 ELSE 0 END) AS ac_on_count
     FROM sensor_data
     WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
     GROUP BY bucket
     ORDER BY bucket ASC`,
    [hoursBack]
  );

  return rows as Array<{
    bucket: string;
    avg_temperature: number;
    avg_humidity: number;
    fan_on_count: number;
    ac_on_count: number;
  }>;
}
