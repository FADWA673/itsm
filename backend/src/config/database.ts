import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

// =============================================================================
// Singleton Prisma Client
// =============================================================================

/**
 * Instance Prisma partagée dans toute l'application.
 * Singleton — un seul client pour éviter les connexions multiples.
 */
export const prisma = new PrismaClient({
  log: [
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

// =============================================================================
// Connexion / Déconnexion
// =============================================================================

/**
 * Teste la connexion à la base de données.
 * Appelé au démarrage du serveur (server.ts).
 *
 * @throws Error si la connexion échoue
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("Database connection established");
}

/**
 * Ferme proprement la connexion Prisma.
 * Appelé lors du graceful shutdown (SIGTERM, SIGINT).
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Database connection closed");
}

/**
 * Vérifie que la base de données est accessible.
 * Utilisé par le health check endpoint.
 *
 * @returns true si la DB répond, false sinon
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// Graceful Shutdown
// =============================================================================

/**
 * Enregistre les handlers de shutdown propre.
 * Appelé une fois dans server.ts.
 */
export function registerShutdownHandlers(): void {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal} — shutting down gracefully`);
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
