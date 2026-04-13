import {
  createDevice,
  DeviceType,
  findDeviceById,
  listDevices,
  PowerStatus,
  updateDeviceState
} from "../models/device.model";
import {
  createDefaultDeviceSettings,
  updateDeviceClimateSettings,
  DeviceSettingsInput
} from "../models/deviceSettings.model";
import { createLog } from "../models/log.model";
import { ApiError } from "../utils/apiError";
import { publishDeviceControlCommand } from "./mqtt.service";
import { emitDeviceStatus } from "./realtime.service";

function extractClimateSettings(settings?: Record<string, unknown>): DeviceSettingsInput {
  if (!settings) return {};

  const targetTemperature = typeof settings.targetTemp === "number" ? settings.targetTemp : typeof settings.targetTemperature === "number" ? settings.targetTemperature : undefined;
  const humidityTarget = typeof settings.humidityTarget === "number" ? settings.humidityTarget : undefined;
  const mode = typeof settings.mode === "string" ? (settings.mode as DeviceSettingsInput["mode"]) : undefined;
  const fanSpeed = typeof settings.fanSpeed === "number" ? settings.fanSpeed : undefined;
  const autoControlEnabled = typeof settings.autoControlEnabled === "boolean" ? settings.autoControlEnabled : undefined;

  return {
    targetTemperature,
    humidityTarget,
    mode,
    fanSpeed,
    autoControlEnabled
  };
}

export function getDevices() {
  return listDevices();
}

export async function createNewDevice(payload: {
  actorUserId: number;
  name: string;
  serialNumber: string;
  type: DeviceType;
  status: PowerStatus;
  settings?: Record<string, unknown>;
}) {
  const deviceId = await createDevice({
    userId: payload.actorUserId,
    name: payload.name,
    serialNumber: payload.serialNumber,
    type: payload.type,
    status: payload.status,
    settings: payload.settings
  });

  await createDefaultDeviceSettings(deviceId, extractClimateSettings(payload.settings));

  const created = await findDeviceById(deviceId);

  await createLog({
    level: "info",
    source: "device-create",
    message: "Device created",
    metadata: { deviceId, actorUserId: payload.actorUserId }
  });

  if (created) {
    emitDeviceStatus(created);
  }

  return created;
}

export async function toggleDevicePower(deviceId: number, actorUserId: number) {
  const existingDevice = await findDeviceById(deviceId);
  if (!existingDevice) {
    throw new ApiError(404, "Device not found");
  }

  const nextPowerStatus: PowerStatus = existingDevice.power_status === "on" ? "off" : "on";

  await updateDeviceState(deviceId, {
    power_status: nextPowerStatus,
    status: "online"
  });

  const updated = await findDeviceById(deviceId);

  await createLog({
    level: "info",
    source: "device-toggle",
    message: "Device power status toggled",
    metadata: { deviceId, powerStatus: nextPowerStatus }
  });

  if (updated) {
    emitDeviceStatus(updated);
    publishDeviceControlCommand({
      deviceId: updated.id,
      serialNumber: updated.serial_number,
      fanStatus: updated.fan_status,
      acStatus: updated.ac_status,
      requestedBy: actorUserId
    });
  }

  return updated;
}

export async function updateDeviceSettings(deviceId: number, settings: Record<string, unknown>) {
  const existingDevice = await findDeviceById(deviceId);
  if (!existingDevice) {
    throw new ApiError(404, "Device not found");
  }

  const mergedSettings = {
    ...(existingDevice.settings || {}),
    ...settings
  };

  await updateDeviceState(deviceId, {
    settings_json: JSON.stringify(mergedSettings),
    status: "online"
  });

  await updateDeviceClimateSettings(deviceId, extractClimateSettings(settings));

  const updated = await findDeviceById(deviceId);

  await createLog({
    level: "info",
    source: "device-settings",
    message: "Device settings updated",
    metadata: { deviceId, updatedKeys: Object.keys(settings) }
  });

  if (updated) {
    emitDeviceStatus(updated);
  }

  return updated;
}

export async function controlDevice(
  deviceId: number,
  payload: { fanStatus?: "on" | "off"; acStatus?: "on" | "off" },
  actorUserId: number
) {
  const existingDevice = await findDeviceById(deviceId);
  if (!existingDevice) {
    throw new ApiError(404, "Device not found");
  }

  if (!payload.fanStatus && !payload.acStatus) {
    throw new ApiError(400, "At least one control field must be provided");
  }

  await updateDeviceState(deviceId, {
    fan_status: payload.fanStatus,
    ac_status: payload.acStatus,
    power_status: payload.fanStatus === "on" || payload.acStatus === "on" ? "on" : existingDevice.power_status,
    status: "online"
  });

  const updated = await findDeviceById(deviceId);
  if (updated) {
    emitDeviceStatus(updated);
    publishDeviceControlCommand({
      deviceId: updated.id,
      serialNumber: updated.serial_number,
      fanStatus: updated.fan_status,
      acStatus: updated.ac_status,
      requestedBy: actorUserId
    });
  }

  await createLog({
    level: "info",
    source: "device-control",
    message: "Legacy device control applied",
    metadata: { deviceId, updates: payload }
  });

  return updated;
}
