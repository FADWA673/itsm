import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import type { CreateTicketRequest, TicketResponse } from "./tickets.types";

function formatTicket(ticket: {
  id: string; ticketNumber: string; category: string; subject: string;
  description: string; priority: string; impact: string; status: string;
  createdById: string; assignedToId: string | null;
  organizationId: string; createdAt: Date; updatedAt: Date; resolvedAt: Date | null;
  createdBy: { firstName: string; lastName: string };
  assignedTo: { firstName: string; lastName: string } | null;
}): TicketResponse {
  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    category: ticket.category,
    subject: ticket.subject,
    description: ticket.description,
    priority: ticket.priority,
    impact: ticket.impact,
    status: ticket.status,
    createdById: ticket.createdById,
    createdByName: `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`,
    assignedToId: ticket.assignedToId,
    assignedToName: ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : null,
    organizationId: ticket.organizationId,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    resolvedAt: ticket.resolvedAt ? ticket.resolvedAt.toISOString() : null,
  };
}

function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `INC-${year}-${random}`;
}

export class TicketsService {
  async create(data: CreateTicketRequest, userId: string, organizationId: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        category: data.category,
        subject: data.subject,
        description: data.description,
        priority: data.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        impact: data.impact as "INDIVIDUAL" | "DEPARTMENT" | "MULTIPLE_DEPARTMENTS" | "ENTIRE_ORGANIZATION",
        status: "OPEN",
        createdById: userId,
        organizationId,
      },
      include: { createdBy: true, assignedTo: true },
    });
    return formatTicket(ticket);
  }

  async findByUser(userId: string): Promise<TicketResponse[]> {
    const tickets = await prisma.ticket.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      include: { createdBy: true, assignedTo: true },
    });
    return tickets.map(formatTicket);
  }

  async findByOrganization(organizationId: string): Promise<TicketResponse[]> {
    const tickets = await prisma.ticket.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { createdBy: true, assignedTo: true },
    });
    return tickets.map(formatTicket);
  }

  async findById(id: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { createdBy: true, assignedTo: true },
    });
    if (!ticket) throw new ApiError(404, "Ticket not found");
    return formatTicket(ticket);
  }

  async updateStatus(id: string, status: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        status: status as "OPEN" | "IN_PROGRESS" | "WAITING_FOR_USER" | "RESOLVED" | "CLOSED",
        ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
      },
      include: { createdBy: true, assignedTo: true },
    });
    return formatTicket(ticket);
  }

  async assign(id: string, technicianId: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { assignedToId: technicianId, status: "IN_PROGRESS" },
      include: { createdBy: true, assignedTo: true },
    });
    return formatTicket(ticket);
  }
}

export const ticketsService = new TicketsService();
