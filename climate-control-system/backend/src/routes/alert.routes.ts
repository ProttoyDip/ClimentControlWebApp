import { Router } from "express";
import { recentAlerts } from "../controllers/alert.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const alertRouter = Router();

alertRouter.get("/", authenticate, authorize("admin", "user"), recentAlerts);

export default alertRouter;
