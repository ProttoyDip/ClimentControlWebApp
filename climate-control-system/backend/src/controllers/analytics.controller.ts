import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getAnalyticsSummary, getPredictiveSignals } from "../services/analytics.service";

export const summary = asyncHandler(async (req: Request, res: Response) => {
  const rawPeriod = req.query.period as string | undefined;
  const period = rawPeriod === "week" || rawPeriod === "month" ? rawPeriod : "day";
  const data = await getAnalyticsSummary(period);
  res.status(200).json({ data });
});

export const prediction = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getPredictiveSignals();
  res.status(200).json({ data });
});
