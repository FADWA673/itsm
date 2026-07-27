import winston from "winston";
import { config } from "../config";

const { combine, timestamp, colorize, printf, json } = winston.format;

const consoleFormat = printf(
  ({ level, message, timestamp: ts }: winston.Logform.TransformableInfo) => {
    return `${String(ts)} [${level}]: ${String(message)}`;
  }
);

export const logger = winston.createLogger({
  level: config.log.level,
  levels: { ...winston.config.npm.levels, http: 5 },
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss" }),
        consoleFormat
      ),
    }),
  ],
});

// En production, ajouter un fichier de log
if (config.nodeEnv === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(timestamp(), json()),
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/app.log",
      format: combine(timestamp(), json()),
    })
  );
}
