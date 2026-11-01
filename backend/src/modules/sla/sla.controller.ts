import { Request, Response, NextFunction } from 'express';
import { slaService } from './sla.service';

/**
 * GET /api/v1/sla/configs
 * Obtenir toutes les configurations SLA
 */
export const getAllConfigs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await slaService.getAllConfigs();
    res.status(200).json({ data: configs });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/sla/configs/:priority
 * Obtenir la configuration SLA pour une priorité
 */
export const getConfigByPriority = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { priority } = req.params;
    const config = await slaService.getConfig(priority.toUpperCase());
    res.status(200).json({ data: config });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/sla/configs/:priority
 * Mettre à jour une configuration SLA (Admin only)
 */
export const updateConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { priority } = req.params;
    const { responseTime, resolveTime } = req.body;

    const config = await slaService.updateConfig(
      priority.toUpperCase(),
      responseTime,
      resolveTime
    );

    res.status(200).json({ data: config });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/sla/tickets/at-risk
 * Obtenir les tickets à risque (< 30 min)
 */
export const getTicketsAtRisk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user.organizationId;
    const tickets = await slaService.getTicketsAtRisk(organizationId);
    res.status(200).json({ data: tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/sla/tickets/breached
 * Obtenir les tickets qui ont breached le SLA
 */
export const getBreachedTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user.organizationId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    const tickets = await slaService.getBreachedTickets(organizationId, limit);
    res.status(200).json({ data: tickets });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/sla/statistics
 * Obtenir les statistiques SLA
 */
export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.user.organizationId;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const stats = await slaService.getStatistics(organizationId, start, end);
    res.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/sla/tickets/:id/check
 * Vérifier le statut SLA d'un ticket spécifique
 */
export const checkTicketSLA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const slaCheck = await slaService.checkUpcomingBreach(id);
    res.status(200).json({ data: slaCheck });
  } catch (error) {
    next(error);
  }
};
