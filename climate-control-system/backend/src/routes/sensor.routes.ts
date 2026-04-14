import { Router } from "express";
import { byDevice, ingest, latest, statusBySerial } from "../controllers/sensor.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { authenticateDevice } from "../middlewares/iotAuth.middleware";
import { iotIngressRateLimit } from "../middlewares/rateLimit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ingestSensorSchema, sensorStatusBySerialSchema } from "../validators/sensor.validator";

const sensorRouter = Router();

sensorRouter.post("/data", authenticateDevice, iotIngressRateLimit, validate(ingestSensorSchema), ingest);

// Backward compatible endpoint
sensorRouter.post("/ingest", authenticateDevice, iotIngressRateLimit, validate(ingestSensorSchema), ingest);

sensorRouter.get("/latest", authenticate, latest);
sensorRouter.get("/device/:deviceId", authenticate, authorize("admin", "user"), byDevice);
sensorRouter.get(
	"/status/:deviceSerial",
	authenticate,
	authorize("admin", "user"),
	validate(sensorStatusBySerialSchema),
	statusBySerial
);

export default sensorRouter;
