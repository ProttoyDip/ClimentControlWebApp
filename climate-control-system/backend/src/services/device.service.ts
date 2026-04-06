import {
  createDevice,
  DeviceType,
  findDeviceById,
  listDevices,
  PowerStatus,
  updateDeviceState
} from "../models/device.model";
import { createLog } from "../models/log.model";
import { ApiError } from "../utils/apiError";
import { emitDeviceStatus } from "./realtime.service";

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

export async function toggleDevicePower(deviceId: number) {
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
  payload: { fanStatus?: "on" | "off"; acStatus?: "on" | "off" }
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
  }

  await createLog({
    level: "info",
    source: "device-control",
    message: "Legacy device control applied",
    metadata: { deviceId, updates: payload }
  });

  return updated;
}
