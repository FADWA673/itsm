import api from './api';

export interface SLAConfig {
  id: string;
  priority: string;
  responseTime: number; // Minutes
  resolveTime: number; // Minutes
  createdAt: string;
  updatedAt: string;
}

export interface SLACheck {
  isAtRisk: boolean;
  minutesRemaining: number;
  percentageConsumed: number;
  deadline: string | null;
}

export interface SLAStatistics {
  totalResolved: number;
  slaRespected: number;
  slaBreached: number;
  slaPercentage: number;
  avgResolutionTimeMinutes: number;
  avgResolutionTimeHours: number;
  statsByPriority: {
    priority: string;
    total: number;
    breached: number;
    respected: number;
    percentage: number;
  }[];
}

class SLAService {
  /**
   * Get all SLA configurations
   */
  async getAllConfigs(): Promise<SLAConfig[]> {
    const response = await api.get('/sla/configs');
    return response.data.data;
  }

  /**
   * Get SLA config for a specific priority
   */
  async getConfigByPriority(priority: string): Promise<SLAConfig> {
    const response = await api.get(`/sla/configs/${priority}`);
    return response.data.data;
  }

  /**
   * Update SLA configuration (Admin only)
   */
  async updateConfig(
    priority: string,
    responseTime: number,
    resolveTime: number
  ): Promise<SLAConfig> {
    const response = await api.put(`/sla/configs/${priority}`, {
      responseTime,
      resolveTime,
    });
    return response.data.data;
  }

  /**
   * Get tickets at risk (< 30 min remaining)
   */
  async getTicketsAtRisk(): Promise<any[]> {
    const response = await api.get('/sla/tickets/at-risk');
    return response.data.data;
  }

  /**
   * Get tickets that breached SLA
   */
  async getBreachedTickets(limit: number = 50): Promise<any[]> {
    const response = await api.get('/sla/tickets/breached', {
      params: { limit },
    });
    return response.data.data;
  }

  /**
   * Get SLA statistics
   */
  async getStatistics(startDate?: string, endDate?: string): Promise<SLAStatistics> {
    const response = await api.get('/sla/statistics', {
      params: { startDate, endDate },
    });
    return response.data.data;
  }

  /**
   * Check SLA status for a specific ticket
   */
  async checkTicketSLA(ticketId: string): Promise<SLACheck> {
    const response = await api.get(`/sla/tickets/${ticketId}/check`);
    return response.data.data;
  }

  /**
   * Format minutes to human readable string
   */
  formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
  }

  /**
   * Get SLA status color and icon
   */
  getSLAStatus(percentageConsumed: number, minutesRemaining: number): {
    color: string;
    icon: string;
    label: string;
  } {
    if (minutesRemaining < 0) {
      return { color: '#DC2626', icon: '🔴', label: 'BREACHED' };
    }
    if (percentageConsumed >= 75) {
      return { color: '#F59E0B', icon: '🟠', label: 'AT RISK' };
    }
    return { color: '#10B981', icon: '🟢', label: 'OK' };
  }
}

export const slaService = new SLAService();
export default slaService;
