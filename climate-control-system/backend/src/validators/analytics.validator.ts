import { z } from "zod";

export const analyticsSummarySchema = z.object({
  query: z.object({
    period: z.enum(["day", "week", "month"]).optional()
  })
});
