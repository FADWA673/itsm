import { Request, Response } from "express";
import { ratingsService } from "./ratings.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";

/**
 * POST /api/v1/tickets/:id/rate
 * Créer une note de satisfaction pour un ticket
 */
export const createRating = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const ticketId = req.params["id"] as string;
  const { rating, comment } = req.body as { rating: number; comment?: string };

  if (!rating) {
    throw new ApiError(400, "Rating is required");
  }

  const result = await ratingsService.createRating(ticketId, req.user.id, {
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    message: "Rating submitted successfully",
    data: result,
  });
});

/**
 * GET /api/v1/tickets/:id/rating
 * Récupérer la note d'un ticket
 */
export const getRating = asyncHandler(async (req: Request, res: Response) => {
  const ticketId = req.params["id"] as string;
  const rating = await ratingsService.getRatingByTicket(ticketId);

  res.json({
    success: true,
    message: rating ? "Rating retrieved" : "No rating found",
    data: rating,
  });
});

/**
 * GET /api/v1/ratings/statistics
 * Récupérer les statistiques de satisfaction (Admin)
 */
export const getStatistics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const stats = await ratingsService.getStatistics(req.user.organizationId);

  res.json({
    success: true,
    message: "Statistics retrieved",
    data: stats,
  });
});

/**
 * GET /api/v1/ratings/statistics/technicians
 * Récupérer les statistiques par technicien (Admin)
 */
export const getTechnicianStatistics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const stats = await ratingsService.getStatisticsByTechnician(req.user.organizationId);

  res.json({
    success: true,
    message: "Technician statistics retrieved",
    data: stats,
  });
});
