import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { config } from "../config";
import { ApiResponse } from "../types/api.types";

/**
 * Middleware de gestion centralisée des erreurs.
 * Doit être monté EN DERNIER dans app.ts, après toutes les routes.
 *
 * - Si c'est une ApiError : renvoie le statusCode et message définis
 * - Sinon : log l'erreur et renvoie 500
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  void next; // Requis par Express pour identifier ce middleware comme error handler (4 params)
  if (err instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      error: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Erreur inconnue — log complet en dev, message générique en prod
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });

  const response: ApiResponse = {
    success: false,
    message: "Internal server error",
    error: config.nodeEnv === "development" ? err.message : "Internal server error",
  };

  res.status(500).json(response);
};
