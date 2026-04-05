import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type UserRole = "admin" | "user";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authorization.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      id: number;
      email: string;
      role: UserRole;
    };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
