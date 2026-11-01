/**
 * Statistics Service
 * Calcule les statistiques pour les dashboards
 */

import { prisma } from '../../config/database';
import type {
  TicketsByStatusData,
  TicketsOverTimeData,
  TechnicianPerformanceData,
  SLAComplianceData,
  DashboardStatistics,
} from './statistics.types';

/**
 * Récupère toutes les statistiques du dashboard
 */
export async function getDashboardStatistics(organizationId: string): Promise<DashboardStatistics> {
  const [byStatus, overTime, techPerformance, slaCompliance] = await Promise.all([
    getTicketsByStatus(organizationId),
    getTicketsOverTime(organizationId, 7),
    getTechnicianPerformance(organizationId),
    getSLACompliance(organizationId),
  ]);

  return {
    byStatus,
    overTime,
    techPerformance,
    slaCompliance,
  };
}

/**
 * Compte les tickets par statut
 */
export async function getTicketsByStatus(organizationId: string): Promise<TicketsByStatusData[]> {
  const tickets = await prisma.ticket.groupBy({
    by: ['status'],
    where: { organizationId },
    _count: { status: true },
  });

  return tickets.map((ticket) => ({
    status: ticket.status,
    count: ticket._count.status,
  }));
}

/**
 * Récupère l'évolution des tickets dans le temps
 */
export async function getTicketsOverTime(
  organizationId: string,
  days: number = 7
): Promise<TicketsOverTimeData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Initialiser tous les jours avec 0
  const dataMap = new Map<string, { created: number; resolved: number }>();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = formatDate(date);
    dataMap.set(dateKey, { created: 0, resolved: 0 });
  }

  // Récupérer tous les tickets créés dans la période
  const createdTickets = await prisma.ticket.findMany({
    where: {
      organizationId,
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
  });

  // Compter les tickets créés par jour
  createdTickets.forEach((ticket) => {
    const dateKey = formatDate(ticket.createdAt);
    const data = dataMap.get(dateKey);
    if (data) {
      data.created++;
    }
  });

  // Récupérer tous les tickets résolus dans la période
  const resolvedTickets = await prisma.ticket.findMany({
    where: {
      organizationId,
      resolvedAt: { 
        gte: startDate,
        not: null 
      },
    },
    select: {
      resolvedAt: true,
    },
  });

  // Compter les tickets résolus par jour
  resolvedTickets.forEach((ticket) => {
    if (ticket.resolvedAt) {
      const dateKey = formatDate(ticket.resolvedAt);
      const data = dataMap.get(dateKey);
      if (data) {
        data.resolved++;
      }
    }
  });

  // Convertir la Map en Array
  return Array.from(dataMap.entries()).map(([date, counts]) => ({
    date,
    created: counts.created,
    resolved: counts.resolved,
  }));
}

/**
 * Récupère les performances des techniciens
 */
export async function getTechnicianPerformance(
  organizationId: string
): Promise<TechnicianPerformanceData[]> {
  // Récupérer tous les techniciens
  const technicians = await prisma.user.findMany({
    where: {
      organizationId,
      role: 'TECHNICIAN',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  // Pour chaque technicien, compter les tickets assignés et résolus
  const performanceData = await Promise.all(
    technicians.map(async (tech) => {
      const [assignedCount, resolvedCount] = await Promise.all([
        prisma.ticket.count({
          where: {
            organizationId,
            assignedToId: tech.id,
          },
        }),
        prisma.ticket.count({
          where: {
            organizationId,
            assignedToId: tech.id,
            status: 'RESOLVED',
          },
        }),
      ]);

      return {
        technicianId: tech.id,
        name: `${tech.firstName} ${tech.lastName}`,
        assigned: assignedCount,
        resolved: resolvedCount,
      };
    })
  );

  // Filtrer les techniciens qui ont au moins 1 ticket assigné
  const filteredData = performanceData.filter((data) => data.assigned > 0);

  // Trier par nombre de tickets résolus (décroissant)
  return filteredData.sort((a, b) => b.resolved - a.resolved);
}

/**
 * Calcule la conformité SLA
 */
export async function getSLACompliance(organizationId: string): Promise<SLAComplianceData> {
  // Récupérer tous les tickets résolus
  const resolvedTickets = await prisma.ticket.findMany({
    where: {
      organizationId,
      status: { in: ['RESOLVED', 'CLOSED'] },
      resolvedAt: { not: null },
    },
    select: {
      createdAt: true,
      resolvedAt: true,
      priority: true,
    },
  });

  if (resolvedTickets.length === 0) {
    return {
      percentage: 0,
      total: 0,
      withinSLA: 0,
      breached: 0,
    };
  }

  // Définir les SLA en heures selon la priorité
  const SLA_HOURS: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 8,
    MEDIUM: 24,
    LOW: 72,
  };

  let withinSLA = 0;
  let breached = 0;

  resolvedTickets.forEach((ticket) => {
    if (!ticket.resolvedAt) return;

    const resolutionTimeHours =
      (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
    const slaHours = SLA_HOURS[ticket.priority] || 24;

    if (resolutionTimeHours <= slaHours) {
      withinSLA++;
    } else {
      breached++;
    }
  });

  const total = resolvedTickets.length;
  const percentage = Math.round((withinSLA / total) * 100);

  return {
    percentage,
    total,
    withinSLA,
    breached,
  };
}

/**
 * Formate une date en DD/MM
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}
