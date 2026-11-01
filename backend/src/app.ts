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

  // ─── CORS (DOIT ÊTRE AVANT RATE LIMITING) ────────────────────────────────────
  // Configuration CORS unifiée
  const corsOptions = config.nodeEnv === "development" 
    ? {
        origin: "*", // Autorise TOUTES les origines en dev
        credentials: false, // Pas de credentials avec origin: "*"
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        exposedHeaders: ["Content-Disposition"],
        preflightContinue: false,
        optionsSuccessStatus: 204,
      }
    : {
        origin: config.cors.origin.split(",").map((o: string) => o.trim()),
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        exposedHeaders: ["Content-Disposition"],
        preflightContinue: false,
        optionsSuccessStatus: 204,
      };

  app.use(cors(corsOptions));
  
  if (config.nodeEnv === "development") {
    console.log("🔓 [CORS] Development mode: All origins allowed");
  } else {
    console.log(`🔐 [CORS] Production mode: Allowed origins: ${config.cors.origin}`);
  }

  // ─── Rate Limiting global (désactivé en dev) ─────────────────────────────────
  if (config.nodeEnv === "production") {
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
    console.log(`⏱️ [RATE LIMIT] Production: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs}ms`);
  } else {
    console.log("⏱️ [RATE LIMIT] Development: Rate limiting disabled");
  }

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
