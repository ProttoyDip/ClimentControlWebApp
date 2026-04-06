import { Router } from "express";
import { byDevice, ingest, latest } from "../controllers/sensor.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { iotIngressRateLimit } from "../middlewares/rateLimit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ingestSensorSchema } from "../validators/sensor.validator";

const sensorRouter = Router();

sensorRouter.post("/data", iotIngressRateLimit, validate(ingestSensorSchema), ingest);

// Backward compatible endpoint
sensorRouter.post("/ingest", iotIngressRateLimit, validate(ingestSensorSchema), ingest);

sensorRouter.get("/latest", authenticate, latest);
sensorRouter.get("/device/:deviceId", authenticate, authorize("admin", "user"), byDevice);

export default sensorRouter;
