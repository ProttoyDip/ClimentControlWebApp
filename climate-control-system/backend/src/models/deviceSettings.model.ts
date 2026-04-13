import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export type ClimateMode = "auto" | "cool" | "dry" | "fan" | "off";

export interface DeviceSettings {
  id: number;
  device_id: number;
  target_temperature: number;
  humidity_target: number | null;
  mode: ClimateMode;
  fan_speed: number;
  auto_control_enabled: number;
  created_at: string;
  updated_at: string;
}

export interface DeviceSettingsInput {
  targetTemperature?: number;
  humidityTarget?: number | null;
  mode?: ClimateMode;
  fanSpeed?: number;
  autoControlEnabled?: boolean;
}

function normalizeClimateMode(value?: string): ClimateMode {
  if (value === "auto" || value === "cool" || value === "dry" || value === "fan" || value === "off") {
    return value;
  }
  return "auto";
}

function normalizeFanSpeed(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(5, Math.trunc(value)));
}

function normalizeTemperature(value?: number, fallback = 22) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(16, Math.min(30, Number(value.toFixed(1))));
}

function normalizeHumidity(value?: number | null) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
}

function normalizeAutoControlEnabled(value?: boolean) {
  return value === false ? 0 : 1;
}

export async function createDefaultDeviceSettings(deviceId: number, input: DeviceSettingsInput = {}) {
  await pool.execute<ResultSetHeader>(
    `INSERT INTO device_settings (
      device_id,
      target_temperature,
      humidity_target,
      mode,
      fan_speed,
      auto_control_enabled
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      target_temperature = VALUES(target_temperature),
      humidity_target = VALUES(humidity_target),
      mode = VALUES(mode),
      fan_speed = VALUES(fan_speed),
      auto_control_enabled = VALUES(auto_control_enabled),
      updated_at = CURRENT_TIMESTAMP`,
    [
      deviceId,
      normalizeTemperature(input.targetTemperature),
      normalizeHumidity(input.humidityTarget),
      normalizeClimateMode(input.mode),
      normalizeFanSpeed(input.fanSpeed),
      normalizeAutoControlEnabled(input.autoControlEnabled)
    ]
  );
}

export async function updateDeviceClimateSettings(deviceId: number, input: DeviceSettingsInput) {
  const fields: string[] = [];
  const values: Array<number | string | null> = [];

  if (input.targetTemperature !== undefined) {
    fields.push("target_temperature = ?");
    values.push(normalizeTemperature(input.targetTemperature));
  }

  if (input.humidityTarget !== undefined) {
    fields.push("humidity_target = ?");
    values.push(normalizeHumidity(input.humidityTarget));
  }

  if (input.mode !== undefined) {
    fields.push("mode = ?");
    values.push(normalizeClimateMode(input.mode));
  }

  if (input.fanSpeed !== undefined) {
    fields.push("fan_speed = ?");
    values.push(normalizeFanSpeed(input.fanSpeed));
  }

  if (input.autoControlEnabled !== undefined) {
    fields.push("auto_control_enabled = ?");
    values.push(normalizeAutoControlEnabled(input.autoControlEnabled));
  }

  if (!fields.length) {
    return null;
  }

  values.push(deviceId);

  await pool.execute<ResultSetHeader>(
    `UPDATE device_settings SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE device_id = ?`,
    values
  );

  return getDeviceSettingsByDeviceId(deviceId);
}

export async function getDeviceSettingsByDeviceId(deviceId: number) {
  const [rows] = await pool.execute<(DeviceSettings & RowDataPacket)[]>(
    `SELECT id, device_id, target_temperature, humidity_target, mode, fan_speed, auto_control_enabled, created_at, updated_at
     FROM device_settings
     WHERE device_id = ?
     LIMIT 1`,
    [deviceId]
  );

  const row = rows[0] || null;
  return row ? row : null;
}
