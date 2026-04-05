import { Router } from "express";
import { control, list } from "../controllers/device.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { deviceControlSchema } from "../validators/device.validator";

const deviceRouter = Router();

deviceRouter.get("/", authenticate, authorize("admin", "user"), list);
deviceRouter.post(
  "/:deviceId/control",
  authenticate,
  authorize("admin"),
  validate(deviceControlSchema),
  control
);

export default deviceRouter;
