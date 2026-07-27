import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config";
import { logger } from "./utils/logger";
import apiRouter from "./routes";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  // ─── Sécurité ────────────────────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.cors.origin,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ─── Parsing ─────────────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ─── HTTP Logging ─────────────────────────────────────────────────────────────
  const morganFormat = config.nodeEnv === "production" ? "combined" : "dev";
  app.use(
    morgan(morganFormat, {
      stream: { write: (message) => logger.http(message.trim()) },
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
