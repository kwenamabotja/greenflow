import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import { notFound, globalErrorHandler } from "./middlewares/errorHandler";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
const skipClerk =
  !clerkPublishableKey || clerkPublishableKey.includes("placeholder");

if (skipClerk) {
  logger.warn(
    "Skipping Clerk middleware because CLERK_PUBLISHABLE_KEY is missing or placeholder. Auth-protected routes will allow unauthenticated access.",
  );
} else {
  app.use(clerkMiddleware());
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many write requests, please slow down." },
});

app.use(cors({ credentials: true, origin: true }));
app.use(limiter);
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use("/api", router);
app.use("/api/wallet/users", writeLimiter);
app.use("/api/transit/virtual-taxis/ping", writeLimiter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
