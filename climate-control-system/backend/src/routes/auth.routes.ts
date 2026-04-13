import { Router } from "express";
import { forgotPassword, login, register, resetPasswordHandler } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import {
	forgotPasswordSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema
} from "../validators/auth.validator";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", validate(resetPasswordSchema), resetPasswordHandler);

export default authRouter;
