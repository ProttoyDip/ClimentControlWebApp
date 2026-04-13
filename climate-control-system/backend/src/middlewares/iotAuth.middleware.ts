import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const validDeviceKeys = env.DEVICE_API_KEYS.split(",")
  .map((key) => key.trim())
  .filter(Boolean);

export function authenticateDevice(req: Request, res: Response, next: NextFunction) {
  if (validDeviceKeys.length === 0) {
    return res.status(503).json({ message: "Device authentication not configured" });
  }

  const headerKey = req.headers["x-device-key"];
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : undefined;

  const providedKey = (typeof headerKey === "string" ? headerKey : undefined) || bearer;

  if (!providedKey || !validDeviceKeys.includes(providedKey)) {
    return res.status(401).json({ message: "Invalid device credentials" });
  }

  next();
}
