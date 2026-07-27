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
};
