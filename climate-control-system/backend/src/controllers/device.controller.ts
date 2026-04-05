import { Request, Response } from "express";
import { controlDevice, getDevices } from "../services/device.service";
import { asyncHandler } from "../utils/asyncHandler";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const devices = await getDevices();
  res.status(200).json({ data: devices });
});

export const control = asyncHandler(async (req: Request, res: Response) => {
  const deviceId = Number(req.params.deviceId);
  const updated = await controlDevice(deviceId, req.body);
  res.status(200).json({ message: "Device updated", data: updated });
});
