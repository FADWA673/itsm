import "dotenv/config";

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
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
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
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    password: process.env.SMTP_PASSWORD || "",
    from: process.env.SMTP_FROM || "",
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
    console.error(`[CONFIG] ${message}`);
    process.exit(1);
  } else {
    console.warn(`[CONFIG] ⚠️  ${message}`);
    console.warn("[CONFIG] Set these variables in backend/.env before using auth features.");
  }
}
