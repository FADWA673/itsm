// Types partagés pour les tickets
export interface TicketHistoryEntry {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// ============================================================================
// SLA Types
// ============================================================================

export interface SLAConfig {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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
  statsByPriority: Array<{
    priority: string;
    total: number;
    breached: number;
    respected: number;
    percentage: number;
  }>;
}

// ============================================================================
// Ticket Type with SLA Fields
// ============================================================================

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: 'INDIVIDUAL' | 'DEPARTMENT' | 'MULTIPLE_DEPARTMENTS' | 'ENTIRE_ORGANIZATION';
  
  // SLA Fields (NEW)
  slaDeadline?: string | null;
  slaBreached: boolean;
  firstResponseAt?: string | null;
  resolutionTime?: number | null;
  
  // Relations
  createdById: string;
  createdByName: string;
  assignedToId?: string | null;
  assignedToName?: string | null;
  organizationId: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}
