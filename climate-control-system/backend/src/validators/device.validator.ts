import { z } from "zod";

export const deviceControlSchema = z.object({
  params: z.object({
    deviceId: z.coerce.number().int().positive()
  }),
  body: z.object({
    fanStatus: z.enum(["on", "off"]).optional(),
    acStatus: z.enum(["on", "off"]).optional()
  })
});
