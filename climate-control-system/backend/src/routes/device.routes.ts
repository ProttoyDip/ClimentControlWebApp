import { Router } from "express";
import { control, create, list, settings, toggle } from "../controllers/device.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createDeviceSchema,
  deviceControlSchema,
  deviceIdSchema,
  updateDeviceSettingsSchema
} from "../validators/device.validator";

const deviceRouter = Router();

deviceRouter.get("/", authenticate, authorize("admin", "user"), list);
deviceRouter.post("/", authenticate, authorize("admin"), validate(createDeviceSchema), create);
deviceRouter.patch("/:id/toggle", authenticate, authorize("admin"), validate(deviceIdSchema), toggle);
deviceRouter.patch(
  "/:id/settings",
  authenticate,
  authorize("admin"),
  validate(updateDeviceSettingsSchema),
  settings
);

// Backward compatible endpoint used by existing frontend
// POST /api/devices/:deviceId/control

deviceRouter.post(
  "/:deviceId/control",
  authenticate,
  authorize("admin"),
  validate(deviceControlSchema),
  control
);

export default deviceRouter;
