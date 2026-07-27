import { Router, Request, Response } from "express";
import { prisma } from "../../config/database";
import { ApiResponse } from "../../types/api.types";
import { logger } from "../../utils/logger";

const router = Router();

/**
 * GET /api/v1/health
 * Health check complet — vérifie le serveur et la connexion à la base de données.
 * Utilisé pour le monitoring, la validation de déploiement et les load balancers.
 *
 * Réponses :
 *   200 — tous les services sont opérationnels (status: "OK")
 *   503 — un ou plusieurs services sont dégradés (status: "DEGRADED")
 */
router.get("/", async (_req: Request, res: Response) => {
  const startTime = Date.now();

  // ─── Test connexion base de données ────────────────────────────────────────
  let dbStatus: "OK" | "ERROR" = "OK";
  let dbError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = "ERROR";
    dbError = error instanceof Error ? error.message : "Unknown database error";
    logger.error(`Health check — database error: ${dbError}`);
  }

  // ─── Calcul du status global ────────────────────────────────────────────────
  const allServicesOk = dbStatus === "OK";
  const httpStatus = allServicesOk ? 200 : 503;
  const globalStatus = allServicesOk ? "OK" : "DEGRADED";

  const response: ApiResponse = {
    success: allServicesOk,
    message: allServicesOk ? "ITSM Backend is running" : "ITSM Backend is degraded",
    data: {
      status: globalStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: Math.round(process.uptime() * 10) / 10, // secondes, 1 décimale
      responseTime: `${Date.now() - startTime}ms`,
      services: {
        database: dbStatus,
        ...(dbError && { databaseError: dbError }),
      },
    },
  };

  res.status(httpStatus).json(response);
});

export default router;
