import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  logger("error", err.message || "Unhandled error", {
    statusCode,
    method: req.method,
    path: req.originalUrl,
    stack: err.stack
  });

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message
  });
}
