export interface CreateTicketRequest {
  categoryId?: string; // Nouveau: ID de la catégorie relationnelle (prioritaire)
  category?: string;   // Ancien: Nom de catégorie (fallback pour compatibilité)
  subject: string;
  description: string;
  priority: string;
  impact: string;
}

export interface TicketResponse {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  impact: string;
  status: string;
  createdById: string;
  createdByName: string;
  assignedToId: string | null;
  assignedToName: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  // SLA fields
  slaDeadline: string | null;
  slaBreached: boolean;
  firstResponseAt: string | null;
  resolutionTime: number | null;
}
