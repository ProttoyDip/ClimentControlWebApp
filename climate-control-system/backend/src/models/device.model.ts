import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export type DeviceType = "ac" | "fan" | "heater";
export type ConnectionStatus = "online" | "offline";
export type PowerStatus = "on" | "off";

export interface Device {
  id: number;
  user_id: number;
  name: string;
  serial_number: string;
  device_type: DeviceType;
  status: ConnectionStatus;
  power_status: PowerStatus;
  fan_status: PowerStatus;
  ac_status: PowerStatus;
  settings_json: string | null;
}

function hydrateSettings(raw: string | null): Record<string, unknown> {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function mapDevice(row: Device) {
  return {
    ...row,
    settings: hydrateSettings(row.settings_json)
  };
}

export async function listDevices() {
  const [rows] = await pool.execute<(Device & RowDataPacket)[]>(
    `SELECT id, user_id, name, serial_number, device_type, status, power_status, fan_status, ac_status, settings_json
     FROM devices
     ORDER BY id DESC`
  );

  return rows.map(mapDevice);
}

export async function findDeviceById(deviceId: number) {
  const [rows] = await pool.execute<(Device & RowDataPacket)[]>(
    `SELECT id, user_id, name, serial_number, device_type, status, power_status, fan_status, ac_status, settings_json
     FROM devices
     WHERE id = ?
     LIMIT 1`,
    [deviceId]
  );

  const row = rows[0] || null;
  return row ? mapDevice(row) : null;
}

export async function findDeviceBySerial(serialNumber: string) {
  const [rows] = await pool.execute<(Device & RowDataPacket)[]>(
    `SELECT id, user_id, name, serial_number, device_type, status, power_status, fan_status, ac_status, settings_json
     FROM devices
     WHERE serial_number = ?
     LIMIT 1`,
    [serialNumber]
  );

  const row = rows[0] || null;
  return row ? mapDevice(row) : null;
}

export async function createDevice(payload: {
  userId: number;
  name: string;
  serialNumber: string;
  type: DeviceType;
  status: PowerStatus;
  settings?: Record<string, unknown>;
}) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO devices (user_id, name, serial_number, device_type, status, power_status, fan_status, ac_status, settings_json)
     VALUES (?, ?, ?, ?, 'online', ?, 'off', 'off', ?)` ,
    [
      payload.userId,
      payload.name,
      payload.serialNumber,
      payload.type,
      payload.status,
      JSON.stringify(payload.settings || {})
    ]
  );

  return result.insertId;
}

export async function updateDeviceState(
  deviceId: number,
  updates: Partial<
    Pick<Device, "fan_status" | "ac_status" | "status" | "power_status" | "device_type" | "settings_json">
  >
) {
  const fields: string[] = [];
  const values: Array<string | number> = [];

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

  if (updates.power_status) {
    fields.push("power_status = ?");
    values.push(updates.power_status);
  }

  if (updates.device_type) {
    fields.push("device_type = ?");
    values.push(updates.device_type);
  }

  if (updates.settings_json !== undefined) {
    fields.push("settings_json = ?");
    values.push(updates.settings_json ?? "{}");
  }

  if (fields.length === 0) {
    return;
  }

  values.push(deviceId);

  await pool.execute<ResultSetHeader>(
    `UPDATE devices SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
}
