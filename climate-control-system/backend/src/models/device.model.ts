import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export interface Device {
  id: number;
  user_id: number;
  name: string;
  serial_number: string;
  status: "online" | "offline";
  fan_status: "on" | "off";
  ac_status: "on" | "off";
}

export async function listDevices() {
  const [rows] = await pool.execute<(Device & RowDataPacket)[]>(
    `SELECT id, user_id, name, serial_number, status, fan_status, ac_status FROM devices ORDER BY id DESC`
  );

  return rows;
}

export async function findDeviceById(deviceId: number) {
  const [rows] = await pool.execute<(Device & RowDataPacket)[]>(
    `SELECT id, user_id, name, serial_number, status, fan_status, ac_status FROM devices WHERE id = ? LIMIT 1`,
    [deviceId]
  );

  return rows[0] || null;
}

export async function findDeviceBySerial(serialNumber: string) {
  const [rows] = await pool.execute<(Device & RowDataPacket)[]>(
    `SELECT id, user_id, name, serial_number, status, fan_status, ac_status FROM devices WHERE serial_number = ? LIMIT 1`,
    [serialNumber]
  );

  return rows[0] || null;
}

export async function updateDeviceState(
  deviceId: number,
  updates: Partial<Pick<Device, "fan_status" | "ac_status" | "status">>
) {
  const fields: string[] = [];
  const values: string[] = [];

  if (updates.fan_status) {
    fields.push("fan_status = ?");
    values.push(updates.fan_status);
  }

  if (updates.ac_status) {
    fields.push("ac_status = ?");
    values.push(updates.ac_status);
  }

  if (updates.status) {
    fields.push("status = ?");
    values.push(updates.status);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(String(deviceId));

  await pool.execute<ResultSetHeader>(
    `UPDATE devices SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
}
