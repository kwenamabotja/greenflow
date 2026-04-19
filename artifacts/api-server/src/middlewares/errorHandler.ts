import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, method: req.method, url: req.url }, "Unhandled error");
  const status = (err as any).status ?? (err as any).statusCode ?? 500;
  const message =
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
}
