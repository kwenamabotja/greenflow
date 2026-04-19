import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // In development, skip auth if Clerk is not configured
  if (process.env.NODE_ENV !== "production" &&
      (!process.env.CLERK_PUBLISHABLE_KEY ||
       process.env.CLERK_PUBLISHABLE_KEY.includes("placeholder"))) {
    next();
    return;
  }

  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
