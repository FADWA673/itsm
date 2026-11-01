/**
 * Statistics Service
 * Fournit les données pour les graphiques du dashboard
 */

import apiClient from './api';

// Types pour les statistiques
export interface TicketsByStatusData {
  status: string;
  count: number;
}

export interface TicketsOverTimeData {
  date: string;
  created: number;
  resolved: number;
}

export interface TechnicianPerformanceData {
  name: string;
  assigned: number;
  resolved: number;
}

export interface SLAComplianceData {
  percentage: number;
  total: number;
  withinSLA: number;
  breached: number;
}

export interface DashboardStatistics {
  byStatus: TicketsByStatusData[];
  overTime: TicketsOverTimeData[];
  techPerformance: TechnicianPerformanceData[];
  slaCompliance: SLAComplianceData;
}

/**
 * Récupère toutes les statistiques du dashboard en une seule requête
 */
export async function getDashboardStatistics(): Promise<DashboardStatistics> {
  try {
    const response = await apiClient.get('/statistics/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    // Retourner des données mock en cas d'erreur (fallback)
    return getMockDashboardStatistics();
  }
}

/**
 * Récupère les statistiques de tickets par statut
 */
export async function getTicketsByStatus(): Promise<TicketsByStatusData[]> {
  try {
    const response = await apiClient.get('/statistics/tickets-by-status');
    return response.data;
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
    return [
      { status: 'OPEN', count: 5 },
      { status: 'ASSIGNED', count: 3 },
      { status: 'IN_PROGRESS', count: 8 },
      { status: 'WAITING_FOR_USER', count: 2 },
      { status: 'RESOLVED', count: 12 },
      { status: 'CLOSED', count: 20 },
    ];
  }
}

/**
 * Récupère l'évolution des tickets dans le temps
 * @param days - Nombre de jours à afficher (défaut: 7)
 */
export async function getTicketsOverTime(days: number = 7): Promise<TicketsOverTimeData[]> {
  try {
    const response = await apiClient.get(`/statistics/tickets-over-time?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tickets over time:', error);
    return [
      { date: '01/09', created: 4, resolved: 2 },
      { date: '02/09', created: 6, resolved: 3 },
      { date: '03/09', created: 5, resolved: 4 },
      { date: '04/09', created: 7, resolved: 5 },
      { date: '05/09', created: 8, resolved: 6 },
      { date: '06/09', created: 3, resolved: 7 },
    ];
  }
}

/**
 * Récupère les performances des techniciens
 */
export async function getTechnicianPerformance(): Promise<TechnicianPerformanceData[]> {
  try {
    const response = await apiClient.get('/statistics/technician-performance');
    return response.data;
  } catch (error) {
    console.error('Error fetching technician performance:', error);
    return [
      { name: 'John Doe', assigned: 15, resolved: 12 },
      { name: 'Sarah Smith', assigned: 12, resolved: 10 },
      { name: 'Mike Johnson', assigned: 10, resolved: 8 },
      { name: 'Emma Wilson', assigned: 8, resolved: 7 },
    ];
  }
}

/**
 * Récupère les statistiques de conformité SLA
 */
export async function getSLACompliance(): Promise<SLAComplianceData> {
  try {
    const response = await apiClient.get('/statistics/sla-compliance');
    return response.data;
  } catch (error) {
    console.error('Error fetching SLA compliance:', error);
    return {
      percentage: 85,
      total: 50,
      withinSLA: 42,
      breached: 8,
    };
  }
}

/**
 * Données mock pour fallback ou développement
 */
function getMockDashboardStatistics(): DashboardStatistics {
  return {
    byStatus: [
      { status: 'OPEN', count: 5 },
      { status: 'ASSIGNED', count: 3 },
      { status: 'IN_PROGRESS', count: 8 },
      { status: 'WAITING_FOR_USER', count: 2 },
      { status: 'RESOLVED', count: 12 },
      { status: 'CLOSED', count: 20 },
    ],
    overTime: [
      { date: '01/09', created: 4, resolved: 2 },
      { date: '02/09', created: 6, resolved: 3 },
      { date: '03/09', created: 5, resolved: 4 },
      { date: '04/09', created: 7, resolved: 5 },
      { date: '05/09', created: 8, resolved: 6 },
      { date: '06/09', created: 3, resolved: 7 },
    ],
    techPerformance: [
      { name: 'John Doe', assigned: 15, resolved: 12 },
      { name: 'Sarah Smith', assigned: 12, resolved: 10 },
      { name: 'Mike Johnson', assigned: 10, resolved: 8 },
      { name: 'Emma Wilson', assigned: 8, resolved: 7 },
    ],
    slaCompliance: {
      percentage: 85,
      total: 50,
      withinSLA: 42,
      breached: 8,
    },
  };
}
