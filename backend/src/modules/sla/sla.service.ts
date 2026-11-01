import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';

export class SLAService {
  /**
   * Calculer la deadline SLA lors de la création du ticket
   */
  async calculateDeadline(priority: string): Promise<Date> {
    const config = await prisma.sLAConfig.findUnique({
      where: { priority },
    });

    if (!config) {
      throw new ApiError(404, `SLA config not found for priority: ${priority}`);
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + config.resolveTime * 60 * 1000);

    return deadline;
  }

  /**
   * Obtenir la configuration SLA pour une priorité
   */
  async getConfig(priority: string) {
    const config = await prisma.sLAConfig.findUnique({
      where: { priority },
    });

    if (!config) {
      throw new ApiError(404, `SLA config not found for priority: ${priority}`);
    }

    return config;
  }

  /**
   * Obtenir toutes les configurations SLA
   */
  async getAllConfigs() {
    return await prisma.sLAConfig.findMany({
      orderBy: { resolveTime: 'asc' },
    });
  }

  /**
   * Vérifier si un ticket est proche de breacher le SLA
   */
  async checkUpcomingBreach(ticketId: string): Promise<{
    isAtRisk: boolean;
    minutesRemaining: number;
    percentageConsumed: number;
    deadline: Date | null;
  }> {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket || !ticket.slaDeadline) {
      return {
        isAtRisk: false,
        minutesRemaining: 0,
        percentageConsumed: 0,
        deadline: null,
      };
    }

    const now = new Date();
    const deadline = new Date(ticket.slaDeadline);
    const createdAt = new Date(ticket.createdAt);

    const totalMinutes = (deadline.getTime() - createdAt.getTime()) / 60000;
    const elapsedMinutes = (now.getTime() - createdAt.getTime()) / 60000;
    const remainingMinutes = (deadline.getTime() - now.getTime()) / 60000;

    const percentageConsumed = (elapsedMinutes / totalMinutes) * 100;
    const isAtRisk = remainingMinutes < 30 && remainingMinutes > 0; // Moins de 30 minutes

    return {
      isAtRisk,
      minutesRemaining: Math.max(0, Math.floor(remainingMinutes)),
      percentageConsumed: Math.min(100, Math.floor(percentageConsumed)),
      deadline: ticket.slaDeadline,
    };
  }

  /**
   * Marquer les tickets en SLA breach
   * Retourne le nombre de tickets marqués
   */
  async markBreachedTickets(): Promise<number> {
    const now = new Date();

    const result = await prisma.ticket.updateMany({
      where: {
        status: { notIn: ['RESOLVED', 'CLOSED'] },
        slaDeadline: { lt: now },
        slaBreached: false,
      },
      data: { slaBreached: true },
    });

    return result.count;
  }

  /**
   * Obtenir les tickets à risque (< 30 minutes restant)
   */
  async getTicketsAtRisk(organizationId?: string): Promise<any[]> {
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    const whereClause: any = {
      status: { notIn: ['RESOLVED', 'CLOSED'] },
      slaDeadline: {
        gte: now,
        lte: thirtyMinutesFromNow,
      },
      slaBreached: false,
    };

    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return tickets;
  }

  /**
   * Obtenir les tickets qui ont breached le SLA
   */
  async getBreachedTickets(organizationId?: string, limit: number = 50): Promise<any[]> {
    const whereClause: any = {
      slaBreached: true,
    };

    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return tickets;
  }

  /**
   * Statistiques SLA pour une organisation
   */
  async getStatistics(organizationId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      organizationId,
      status: { in: ['RESOLVED', 'CLOSED'] },
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Total tickets résolus
    const totalResolved = await prisma.ticket.count({ where: whereClause });

    // Tickets SLA respecté
    const slaRespected = await prisma.ticket.count({
      where: {
        ...whereClause,
        slaBreached: false,
      },
    });

    // Tickets SLA breached
    const slaBreached = await prisma.ticket.count({
      where: {
        ...whereClause,
        slaBreached: true,
      },
    });

    // Pourcentage SLA respecté
    const slaPercentage = totalResolved > 0 ? (slaRespected / totalResolved) * 100 : 0;

    // Temps de résolution moyen
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      select: { resolutionTime: true },
    });

    const avgResolutionTime =
      tickets.length > 0
        ? tickets.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / tickets.length
        : 0;

    // Stats par priorité
    const statsByPriority = await Promise.all(
      ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(async (priority) => {
        const total = await prisma.ticket.count({
          where: { ...whereClause, priority },
        });

        const breached = await prisma.ticket.count({
          where: { ...whereClause, priority, slaBreached: true },
        });

        return {
          priority,
          total,
          breached,
          respected: total - breached,
          percentage: total > 0 ? ((total - breached) / total) * 100 : 0,
        };
      })
    );

    return {
      totalResolved,
      slaRespected,
      slaBreached,
      slaPercentage: Math.round(slaPercentage * 10) / 10,
      avgResolutionTimeMinutes: Math.round(avgResolutionTime),
      avgResolutionTimeHours: Math.round((avgResolutionTime / 60) * 10) / 10,
      statsByPriority,
    };
  }

  /**
   * Mettre à jour une configuration SLA
   */
  async updateConfig(
    priority: string,
    responseTime: number,
    resolveTime: number
  ): Promise<any> {
    const config = await prisma.sLAConfig.update({
      where: { priority },
      data: { responseTime, resolveTime },
    });

    return config;
  }
}

export const slaService = new SLAService();
