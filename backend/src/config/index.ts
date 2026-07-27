import "dotenv/config";
import { logger } from "../utils/logger";

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  cors: {
    origin: string;
  };
  log: {
    level: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL || "",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
  log: {
    level: process.env.LOG_LEVEL || "info",
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },
};

// =============================================================================
// Validation des variables d'environnement critiques
// =============================================================================

/**
 * Valide que les variables d'environnement critiques sont définies.
 * En production : exit si une variable obligatoire manque.
 * En développement : log un avertissement.
 */
export function validateEnv(): void {
  const required = [
    { key: "DATABASE_URL", value: config.database.url },
    { key: "JWT_SECRET", value: config.jwt.secret },
    { key: "JWT_REFRESH_SECRET", value: config.jwt.refreshSecret },
  ];

  const missing = required
    .filter(({ value }) => !value || value.trim() === "")
    .map(({ key }) => key);

  if (missing.length === 0) return;

  const message = `Missing required environment variables: ${missing.join(", ")}`;

  if (config.nodeEnv === "production") {
    logger.error(message);
    process.exit(1);
  } else {
    logger.warn(`⚠️  ${message}`);
    logger.warn("Set these variables in backend/.env before using auth features.");
  }
}
