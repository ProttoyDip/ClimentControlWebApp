import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  controlDevice,
  createNewDevice,
  getDevices,
  toggleDevicePower,
  updateDeviceSettings
} from "../services/device.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const devices = await getDevices();
  res.status(200).json({ data: devices });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const actorUserId = req.user?.id;
  if (!actorUserId) {
    throw new ApiError(401, "Unauthorized");
  }

  const device = await createNewDevice({
    actorUserId,
    name: req.body.name,
    serialNumber: req.body.serialNumber,
    type: req.body.type,
    status: req.body.status,
    settings: req.body.settings
  });

  res.status(201).json({ message: "Device created", data: device });
});

export const toggle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const deviceId = Number(req.params.id);
  const actorUserId = req.user?.id ?? 0;
  const updated = await toggleDevicePower(deviceId, actorUserId);
  res.status(200).json({ message: "Device toggled", data: updated });
});

export const settings = asyncHandler(async (req: Request, res: Response) => {
  const deviceId = Number(req.params.id);
  const updated = await updateDeviceSettings(deviceId, req.body.settings);
  res.status(200).json({ message: "Device settings updated", data: updated });
});

export const control = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const deviceId = Number(req.params.deviceId);
  const actorUserId = req.user?.id ?? 0;
  const updated = await controlDevice(deviceId, req.body, actorUserId);
  res.status(200).json({ message: "Device updated", data: updated });
});
