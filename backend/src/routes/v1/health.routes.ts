import { Router, Request, Response } from "express";
import { ApiResponse } from "../../types/api.types";

const router = Router();

/**
 * GET /api/v1/health
 * Health check — vérifie que le serveur est opérationnel.
 */
router.get("/", (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: "ITSM Backend is running",
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  };
  res.status(200).json(response);
});

export default router;
