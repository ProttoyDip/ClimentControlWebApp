import { z } from "zod";

const powerSchema = z.enum(["on", "off"]);

export const deviceControlSchema = z.object({
  params: z.object({
    deviceId: z.coerce.number().int().positive()
  }),
  body: z.object({
    fanStatus: powerSchema.optional(),
    acStatus: powerSchema.optional()
  })
});

export const createDeviceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    serialNumber: z.string().min(3).max(120),
    type: z.enum(["ac", "fan", "heater"]),
    status: powerSchema.default("off"),
    settings: z.record(z.unknown()).optional()
  })
});

export const deviceIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  })
});

export const updateDeviceSettingsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  }),
  body: z.object({
    settings: z.record(z.unknown())
  })
});
