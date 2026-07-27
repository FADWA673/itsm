import "dotenv/config";
import { createApp } from "./app";
import { config, validateEnv } from "./config";
import { logger } from "./utils/logger";
import { connectDatabase, registerShutdownHandlers } from "./config/database";

async function bootstrap() {
  // ── 0. Validation des variables d'environnement ────────────────────────────
  validateEnv();
  // ── 1. Connexion à la base de données ──────────────────────────────────────
  try {
    await connectDatabase();
  } catch (error) {
    logger.error(
      `Failed to connect to database: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }

  // ── 2. Création de l'application Express ───────────────────────────────────
  const app = createApp();

  // ── 3. Démarrage du serveur ─────────────────────────────────────────────────
  app.listen(config.port, () => {
    logger.info(`ITSM Backend running on port ${config.port} [${config.nodeEnv}]`);
    logger.info(`Health check: http://localhost:${config.port}/api/v1/health`);
  });

  // ── 4. Graceful shutdown handlers ──────────────────────────────────────────
  registerShutdownHandlers();
}

bootstrap();
