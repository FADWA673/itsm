import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

/**
 * Instance Prisma partagée dans toute l'application.
 * Un seul client pour éviter les connexions multiples.
 */
export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" },
  ],
});

// Rediriger les logs Prisma vers Winston
prisma.$on("error", (e: { message: string }) => {
  logger.error(`Prisma error: ${e.message}`);
});

prisma.$on("warn", (e: { message: string }) => {
  logger.warn(`Prisma warning: ${e.message}`);
});
