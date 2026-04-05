import { findDeviceById, listDevices, updateDeviceState } from "../models/device.model";
import { createLog } from "../models/log.model";
import { ApiError } from "../utils/apiError";
import { emitDeviceStatus } from "./realtime.service";

export function getDevices() {
  return listDevices();
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
    status: "online"
  });

  const updated = await findDeviceById(deviceId);
  if (updated) {
    emitDeviceStatus(updated);
  }

  await createLog({
    level: "info",
    source: "device-control",
    message: "Device state updated",
    metadata: { deviceId, updates: payload }
  });

  return updated;
}
