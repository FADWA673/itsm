import { get, post, patch } from "./api";

export interface TicketDTO {
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
}

export interface CreateTicketDTO {
  category: string;
  subject: string;
  description: string;
  priority: string;
  impact: string;
}

export const createTicketApi = (data: CreateTicketDTO) => post<TicketDTO>("/tickets", data);
export const getMyTicketsApi = () => get<TicketDTO[]>("/tickets/my");
export const getAllTicketsApi = () => get<TicketDTO[]>("/tickets");
export const updateTicketStatusApi = (id: string, status: string) => patch<TicketDTO>(`/tickets/${id}/status`, { status });
