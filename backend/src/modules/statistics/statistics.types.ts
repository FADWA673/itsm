/**
 * Statistics Module Types
 */

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
  technicianId: string;
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
