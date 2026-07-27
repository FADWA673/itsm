import { Request, Response } from "express";
import { ApiResponse } from "../types/api.types";

/**
 * Handler 404 — monté après toutes les routes.
 * Renvoie une réponse JSON structurée pour les routes inconnues.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: "Not Found",
  };
  res.status(404).json(response);
};
