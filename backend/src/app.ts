import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { config } from "./config";
import { logger } from "./utils/logger";
import apiRouter from "./routes";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  // ─── Sécurité — Helmet ───────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: config.nodeEnv === "production",
      crossOriginEmbedderPolicy: config.nodeEnv === "production",
    })
  );

  // ─── Rate Limiting global ────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  });
  app.use("/api", limiter);

  // ─── CORS ────────────────────────────────────────────────────────────────────
  const allowedOrigins = config.cors.origin.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // ─── Parsing ─────────────────────────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // ─── HTTP Logging ─────────────────────────────────────────────────────────────
  const morganFormat = config.nodeEnv === "production" ? "combined" : "dev";
  app.use(
    morgan(morganFormat, {
      stream: { write: (message: string) => logger.http(message.trim()) },
    })
  );

  // ─── Routes ──────────────────────────────────────────────────────────────────
  app.use("/api", apiRouter);

  // ─── 404 handler ─────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ─── Error handler (doit être en dernier) ────────────────────────────────────
  app.use(errorHandler);

  return app;
}
