import { get, post, patch } from "./api";
import type { TicketHistoryEntry } from "../types/ticket.types";

export interface TicketDTO {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  impact: string;
  status: string;
  source?: string; // NEW: WEB, WHATSAPP, EMAIL, PHONE
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

export interface CreateTicketDTO {
  categoryId?: string; // Nouveau: ID de la catégorie relationnelle
  category?: string;   // Ancien: Nom de catégorie (fallback pour compatibilité)
  subject: string;
  description: string;
  priority: string;
  impact: string;
}

export const createTicketApi = (data: CreateTicketDTO) => post<TicketDTO>("/tickets", data);
export const getMyTicketsApi = () => get<TicketDTO[]>("/tickets/my");
export const getTicketByIdApi = (id: string) => get<TicketDTO>(`/tickets/${id}`);
export const getAllTicketsApi = () => get<TicketDTO[]>("/tickets");
export const updateTicketStatusApi = (id: string, status: string) => patch<TicketDTO>(`/tickets/${id}/status`, { status });
export const assignTicketApi = (id: string, technicianId: string) => patch<TicketDTO>(`/tickets/${id}/assign`, { technicianId });
export const confirmResolutionApi = (id: string) => post<TicketDTO>(`/tickets/${id}/confirm`, {});
export const cancelTicketApi = (id: string) => post<TicketDTO>(`/tickets/${id}/cancel`, {});
export const claimTicketApi = (id: string) => post<TicketDTO>(`/tickets/${id}/claim`, {});
export const startWorkApi = (id: string) => post<TicketDTO>(`/tickets/${id}/start`, {});
export const putOnHoldApi = (id: string, reason?: string) => post<TicketDTO>(`/tickets/${id}/hold`, { reason });
export const resumeTicketApi = (id: string) => post<TicketDTO>(`/tickets/${id}/resume`, {});
export const resolveTicketApi = (id: string, resolution: string) => post<TicketDTO>(`/tickets/${id}/resolve`, { resolution });
export const reopenTicketApi = (id: string) => post<TicketDTO>(`/tickets/${id}/reopen`, {});
export const deleteTicketApi = (id: string) => fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/tickets/${id}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
}).then(res => res.json());

// ─── History ──────────────────────────────────────────────────────────────────

export type { TicketHistoryEntry } from "../types/ticket.types";

export const getTicketHistoryApi = (id: string) => get<TicketHistoryEntry[]>(`/tickets/${id}/history`);

// ─── Comments ─────────────────────────────────────────────────────────────────

export interface CommentDTO {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
}

export const getCommentsApi = (ticketId: string) => get<CommentDTO[]>(`/tickets/${ticketId}/comments`);
export const addCommentApi = (ticketId: string, content: string) => post<CommentDTO>(`/tickets/${ticketId}/comments`, { content });
