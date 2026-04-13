import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Error categorization for better debugging
 */
enum ErrorCategory {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  DATABASE = "database",
  MQTT = "mqtt",
  EXTERNAL_API = "external_api",
  INTERNAL = "internal",
  UNKNOWN = "unknown"
}

function categorizeError(err: Error, statusCode: number): ErrorCategory {
  if (statusCode === 400) return ErrorCategory.VALIDATION;
  if (statusCode === 401) return ErrorCategory.AUTHENTICATION;
  if (statusCode === 403) return ErrorCategory.AUTHORIZATION;
  if (statusCode === 404) return ErrorCategory.NOT_FOUND;
  if (statusCode === 409) return ErrorCategory.CONFLICT;
  if (err.message.includes("MQTT")) return ErrorCategory.MQTT;
  if (err.message.includes("database") || err.message.includes("ECONNREFUSED")) {
    return ErrorCategory.DATABASE;
  }
  if (statusCode >= 500) return ErrorCategory.INTERNAL;
  return ErrorCategory.UNKNOWN;
}

export function notFound(req: Request, res: Response) {
  const requestId = req.requestId || "unknown";
  logger("warn", "Route not found", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode: 404
  });

  res.status(404).json({
    requestId,
    message: `Route not found: ${req.originalUrl}`,
    error: {
      type: "not_found",
      path: req.originalUrl
    }
  });
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.requestId || "unknown";
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const category = categorizeError(err, statusCode);

  // Structured error logging
  const logContext = {
    requestId,
    statusCode,
    category,
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    userAgent: req.get("user-agent"),
    ipAddress: req.ip
  };

  // Determine log level based on status code
  if (statusCode >= 500) {
    logger("error", `[${statusCode}] ${err.message || "Internal server error"}`, logContext);
  } else if (statusCode >= 400) {
    logger("warn", `[${statusCode}] ${err.message}`, logContext);
  }

  // Determine error response based on status code
  const isProduction = process.env.NODE_ENV === "production";
  const clientMessage =
    statusCode === 500
      ? "Internal server error. Please try again later."
      : err.message || "An error occurred";

  res.status(statusCode).json({
    requestId,
    message: clientMessage,
    error: {
      type: category,
      ...(statusCode >= 500 && {
        details: isProduction ? undefined : err.stack
      })
    }
  });
}

/**
 * Middleware to attach unique request IDs for tracing
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader("X-Request-ID", req.requestId);
  next();
}
