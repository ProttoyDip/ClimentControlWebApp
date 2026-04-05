import { findDeviceBySerial, updateDeviceState } from "../models/device.model";
import { createLog } from "../models/log.model";
import { getLatestReadings, getReadingsByDevice, insertSensorReading } from "../models/sensorData.model";
import { ApiError } from "../utils/apiError";
import { emitSensorUpdate } from "./realtime.service";

export async function ingestSensorData(payload: {
  deviceSerial: string;
  temperature: number;
  humidity: number;
  fanStatus: "on" | "off";
  acStatus: "on" | "off";
  recordedAt?: string;
}) {
  const device = await findDeviceBySerial(payload.deviceSerial);
  if (!device) {
    throw new ApiError(404, "Device not found");
  }

  const readingId = await insertSensorReading({
    deviceId: device.id,
    temperature: payload.temperature,
    humidity: payload.humidity,
    fanStatus: payload.fanStatus,
    acStatus: payload.acStatus,
    recordedAt: payload.recordedAt
  });

  await updateDeviceState(device.id, {
    status: "online",
    fan_status: payload.fanStatus,
    ac_status: payload.acStatus
  });

  emitSensorUpdate({
    id: readingId,
    device_id: device.id,
    temperature: payload.temperature,
    humidity: payload.humidity,
    fan_status: payload.fanStatus,
    ac_status: payload.acStatus,
    recorded_at: payload.recordedAt || new Date().toISOString()
  });

  await createLog({
    level: "info",
    source: "sensor-ingest",
    message: "Sensor data ingested successfully",
    metadata: { deviceId: device.id, readingId }
  });

  return { readingId, deviceId: device.id };
}

export function fetchLatestReadings(limit?: number) {
  return getLatestReadings(limit || 50);
}

export function fetchReadingsByDevice(deviceId: number, limit?: number) {
  return getReadingsByDevice(deviceId, limit || 200);
}
