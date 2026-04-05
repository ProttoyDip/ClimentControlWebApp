import { Request, Response } from "express";
import { fetchLatestReadings, fetchReadingsByDevice, ingestSensorData } from "../services/sensor.service";
import { asyncHandler } from "../utils/asyncHandler";

export const ingest = asyncHandler(async (req: Request, res: Response) => {
  const result = await ingestSensorData(req.body);
  res.status(202).json({ message: "Sensor data accepted", data: result });
});

export const latest = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const readings = await fetchLatestReadings(limit);
  res.status(200).json({ data: readings });
});

export const byDevice = asyncHandler(async (req: Request, res: Response) => {
  const deviceId = Number(req.params.deviceId);
  const limit = req.query.limit ? Number(req.query.limit) : 200;
  const readings = await fetchReadingsByDevice(deviceId, limit);
  res.status(200).json({ data: readings });
});
