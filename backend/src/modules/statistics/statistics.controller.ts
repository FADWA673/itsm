/**
 * Statistics Controller
 * Gère les requêtes HTTP pour les statistiques
 */

import type { Request, Response } from 'express';
import * as statisticsService from './statistics.service';
import { ApiError } from '../../utils/ApiError';

/**
 * GET /api/v1/statistics/dashboard
 * Récupère toutes les statistiques du dashboard
 */
export async function getDashboardStatistics(req: Request, res: Response) {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, 'Organization ID not found');
    }

    const statistics = await statisticsService.getDashboardStatistics(organizationId);

    res.json(statistics);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching dashboard statistics:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }
}

/**
 * GET /api/v1/statistics/tickets-by-status
 * Récupère le nombre de tickets par statut
 */
export async function getTicketsByStatus(req: Request, res: Response) {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, 'Organization ID not found');
    }

    const data = await statisticsService.getTicketsByStatus(organizationId);

    res.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching tickets by status:', error);
      res.status(500).json({ error: 'Failed to fetch tickets by status' });
    }
  }
}

/**
 * GET /api/v1/statistics/tickets-over-time
 * Récupère l'évolution des tickets dans le temps
 */
export async function getTicketsOverTime(req: Request, res: Response) {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, 'Organization ID not found');
    }

    const days = parseInt(req.query.days as string) || 7;
    const data = await statisticsService.getTicketsOverTime(organizationId, days);

    res.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching tickets over time:', error);
      res.status(500).json({ error: 'Failed to fetch tickets over time' });
    }
  }
}

/**
 * GET /api/v1/statistics/technician-performance
 * Récupère les performances des techniciens
 */
export async function getTechnicianPerformance(req: Request, res: Response) {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, 'Organization ID not found');
    }

    const data = await statisticsService.getTechnicianPerformance(organizationId);

    res.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching technician performance:', error);
      res.status(500).json({ error: 'Failed to fetch technician performance' });
    }
  }
}

/**
 * GET /api/v1/statistics/sla-compliance
 * Récupère les statistiques de conformité SLA
 */
export async function getSLACompliance(req: Request, res: Response) {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, 'Organization ID not found');
    }

    const data = await statisticsService.getSLACompliance(organizationId);

    res.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Error fetching SLA compliance:', error);
      res.status(500).json({ error: 'Failed to fetch SLA compliance' });
    }
  }
}
