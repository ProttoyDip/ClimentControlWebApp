import { createAlert } from "../models/alert.model";
import { findDeviceById, findDeviceBySerial, updateDeviceState } from "../models/device.model";
import { createLog } from "../models/log.model";
import { getLatestReadings, getReadingsByDevice, insertSensorReading } from "../models/sensorData.model";
import { env } from "../config/env";
import { ApiError } from "../utils/apiError";
import { emitAlert, emitSensorUpdate } from "./realtime.service";

async function evaluateThresholdAlerts(args: {
  deviceId: number;
  temperature: number;
  humidity: number;
}) {
  if (args.temperature > env.SENSOR_TEMP_ALERT_MAX) {
    const message = `Temperature above threshold (${args.temperature.toFixed(1)}C > ${env.SENSOR_TEMP_ALERT_MAX}C)`;
    await createAlert({
      deviceId: args.deviceId,
      type: "warning",
      message,
      data: { temperature: args.temperature, threshold: env.SENSOR_TEMP_ALERT_MAX }
    });
    emitAlert({
      type: "warning",
      title: "High temperature",
      message,
      deviceId: args.deviceId,
      payload: { temperature: args.temperature, threshold: env.SENSOR_TEMP_ALERT_MAX }
    });
  }

  if (args.humidity < env.SENSOR_HUMIDITY_ALERT_MIN) {
    const message = `Humidity below threshold (${args.humidity.toFixed(1)}% < ${env.SENSOR_HUMIDITY_ALERT_MIN}%)`;
    await createAlert({
      deviceId: args.deviceId,
      type: "warning",
      message,
      data: { humidity: args.humidity, threshold: env.SENSOR_HUMIDITY_ALERT_MIN }
    });
    emitAlert({
      type: "warning",
      title: "Low humidity",
      message,
      deviceId: args.deviceId,
      payload: { humidity: args.humidity, threshold: env.SENSOR_HUMIDITY_ALERT_MIN }
    });
  }
}

export async function ingestSensorData(payload: {
  deviceSerial?: string;
  deviceId?: number;
  temperature: number;
  humidity: number;
  fanStatus?: "on" | "off";
  acStatus?: "on" | "off";
  recordedAt?: string;
}) {
  const device = payload.deviceId
    ? await findDeviceById(payload.deviceId)
    : payload.deviceSerial
      ? await findDeviceBySerial(payload.deviceSerial)
      : null;

  if (!device) {
    throw new ApiError(404, "Device not found");
  }

  const fanStatus = payload.fanStatus ?? device.fan_status;
  const acStatus = payload.acStatus ?? device.ac_status;

  const readingId = await insertSensorReading({
    deviceId: device.id,
    temperature: payload.temperature,
    humidity: payload.humidity,
    fanStatus,
    acStatus,
    recordedAt: payload.recordedAt
  });

  await updateDeviceState(device.id, {
    status: "online",
    fan_status: fanStatus,
    ac_status: acStatus,
    power_status: fanStatus === "on" || acStatus === "on" ? "on" : "off"
  });

  const reading = {
    id: readingId,
    device_id: device.id,
    temperature: payload.temperature,
    humidity: payload.humidity,
    fan_status: fanStatus,
    ac_status: acStatus,
    recorded_at: payload.recordedAt || new Date().toISOString()
  };

  emitSensorUpdate(reading);

  await evaluateThresholdAlerts({
    deviceId: device.id,
    temperature: payload.temperature,
    humidity: payload.humidity
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
