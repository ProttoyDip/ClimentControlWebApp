import { z } from "zod";

export const ingestSensorSchema = z.object({
  body: z.object({
    deviceSerial: z.string().min(3),
    temperature: z.number().min(-40).max(120),
    humidity: z.number().min(0).max(100),
    fanStatus: z.enum(["on", "off"]),
    acStatus: z.enum(["on", "off"]),
    recordedAt: z.string().datetime().optional()
  })
});
