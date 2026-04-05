import { Router } from "express";
import { byDevice, ingest, latest } from "../controllers/sensor.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { ingestSensorSchema } from "../validators/sensor.validator";

const sensorRouter = Router();

sensorRouter.post("/ingest", validate(ingestSensorSchema), ingest);
sensorRouter.get("/latest", authenticate, latest);
sensorRouter.get("/device/:deviceId", authenticate, authorize("admin", "user"), byDevice);

export default sensorRouter;
