import { Router } from "express";
import authRouter from "./auth.routes";
import deviceRouter from "./device.routes";
import sensorRouter from "./sensor.routes";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "climate-control-backend" });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/devices", deviceRouter);
apiRouter.use("/sensors", sensorRouter);

export default apiRouter;
