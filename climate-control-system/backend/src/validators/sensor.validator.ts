import { z } from "zod";

const powerSchema = z.enum(["on", "off"]);

export const ingestSensorSchema = z.object({
  body: z
    .object({
      deviceSerial: z.string().min(3).optional(),
      deviceId: z.coerce.number().int().positive().optional(),
      temperature: z.coerce.number().min(-40).max(120),
      humidity: z.coerce.number().min(0).max(100),
      fanStatus: powerSchema.optional(),
      acStatus: powerSchema.optional(),
      recordedAt: z.string().datetime().optional()
    })
    .refine((data) => Boolean(data.deviceSerial || data.deviceId), {
      message: "Either deviceSerial or deviceId is required",
      path: ["deviceSerial"]
    })
});
