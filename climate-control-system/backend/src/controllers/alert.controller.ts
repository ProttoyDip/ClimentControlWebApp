import { Request, Response } from "express";
import { listAlerts } from "../models/alert.model";
import { asyncHandler } from "../utils/asyncHandler";

export const recentAlerts = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const alerts = await listAlerts(limit);
  res.status(200).json({ data: alerts });
});
