import { Router } from "express";
import { prediction, summary } from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { analyticsSummarySchema } from "../validators/analytics.validator";

const analyticsRouter = Router();

analyticsRouter.get("/summary", authenticate, authorize("admin", "user"), validate(analyticsSummarySchema), summary);
analyticsRouter.get("/prediction", authenticate, authorize("admin", "user"), prediction);

export default analyticsRouter;
