import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { notify } from "../../utils/notify";
import { historyService } from "./history.service";
import { slaService } from "../sla/sla.service";
import type { CreateTicketRequest, TicketResponse } from "./tickets.types";

function formatTicket(ticket: {
  id: string; ticketNumber: string; categoryId: string | null; subject: string;
  description: string; priority: string; impact: string; status: string;
  createdById: string; assignedToId: string | null;
  organizationId: string; createdAt: Date; updatedAt: Date; resolvedAt: Date | null;
  createdBy: { firstName: string; lastName: string };
  assignedTo: { firstName: string; lastName: string } | null;
  category?: { id: string; name: string; icon: string | null } | null;
  // SLA fields
  slaDeadline: Date | null;
  slaBreached: boolean;
  firstResponseAt: Date | null;
  resolutionTime: number | null;
}): TicketResponse {
  // Formater le nom de la catégorie
  let categoryDisplay = "Uncategorized";
  if (ticket.category) {
    categoryDisplay = ticket.category.icon 
      ? `${ticket.category.icon} ${ticket.category.name}` 
      : ticket.category.name;
  }

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    category: categoryDisplay, // Affichage formaté pour le frontend
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
    // SLA fields
    slaDeadline: ticket.slaDeadline ? ticket.slaDeadline.toISOString() : null,
    slaBreached: ticket.slaBreached,
    firstResponseAt: ticket.firstResponseAt ? ticket.firstResponseAt.toISOString() : null,
    resolutionTime: ticket.resolutionTime,
  };
}

function generateTicketNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `INC-${year}-${random}`;
}

export class TicketsService {
  async create(data: CreateTicketRequest, userId: string, organizationId: string): Promise<TicketResponse> {
    // ✅ NOUVEAU : Calculer la deadline SLA
    const slaDeadline = await slaService.calculateDeadline(data.priority);

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        categoryId: data.categoryId || null, // Nouveau: relation vers TicketCategory
        subject: data.subject,
        description: data.description,
        priority: data.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        impact: data.impact as "INDIVIDUAL" | "DEPARTMENT" | "MULTIPLE_DEPARTMENTS" | "ENTIRE_ORGANIZATION",
        status: "OPEN",
        createdById: userId,
        organizationId,
        slaDeadline, // ✅ NOUVEAU
      },
      include: { 
        createdBy: true, 
        assignedTo: true,
        category: true, // Inclure la catégorie relationnelle
      },
    });

    // Enregistrer la création dans l'historique
    await historyService.trackCreation(ticket.id, userId);

    // Notification in-app au créateur
    await notify(
      userId,
      "TICKET_CREATED",
      "Ticket created successfully",
      `Your ticket "${ticket.subject}" (${ticket.ticketNumber}) has been submitted and is pending review.`,
      ticket.id
    );

    return formatTicket(ticket);
  }

  async findByUser(userId: string): Promise<TicketResponse[]> {
    const tickets = await prisma.ticket.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      include: { createdBy: true, assignedTo: true, category: true },
    });
    return tickets.map(formatTicket);
  }

  async findByOrganization(organizationId: string): Promise<TicketResponse[]> {
    const tickets = await prisma.ticket.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { createdBy: true, assignedTo: true, category: true },
    });
    return tickets.map(formatTicket);
  }

  async findUnassigned(organizationId: string): Promise<TicketResponse[]> {
    const tickets = await prisma.ticket.findMany({
      where: {
        organizationId,
        assignedToId: null,
        status: "OPEN", // ✅ Seuls les tickets OPEN peuvent être non assignés
      },
      orderBy: { createdAt: "desc" },
      include: { createdBy: true, assignedTo: true, category: true },
    });
    return tickets.map(formatTicket);
  }

  async findById(id: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { createdBy: true, assignedTo: true, category: true },
    });
    if (!ticket) throw new ApiError(404, "Ticket not found");
    return formatTicket(ticket);
  }

  async updateStatus(id: string, status: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    const oldStatus = ticket.status;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: status as "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "WAITING_FOR_USER" | "RESOLVED" | "CLOSED",
        ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
      },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer le changement de statut dans l'historique
    // Note: userId devrait être passé en paramètre, pour l'instant on utilise le créateur
    await historyService.trackStatusChange(
      id,
      ticket.createdById,
      oldStatus,
      status
    );

    // Notify the ticket creator on status changes
    if (status === "RESOLVED") {
      await notify(
        updatedTicket.createdById,
        "TICKET_RESOLVED",
        "Ticket resolved",
        `Your ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) has been resolved. Please rate the service.`,
        updatedTicket.id
      );
    } else if (status === "CLOSED") {
      await notify(
        updatedTicket.createdById,
        "TICKET_CLOSED",
        "Ticket closed",
        `Your ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) has been closed.`,
        updatedTicket.id
      );
    } else if (status === "WAITING_FOR_USER") {
      await notify(
        updatedTicket.createdById,
        "TICKET_UPDATED",
        "Action required on your ticket",
        `Your ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) is waiting for your response.`,
        updatedTicket.id
      );
    }

    return formatTicket(updatedTicket);
  }

  async assign(id: string, technicianId: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { assignedToId: technicianId, status: "ASSIGNED" }, // ✅ Changé: ASSIGNED au lieu de IN_PROGRESS
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer l'assignation dans l'historique
    await historyService.trackAssignment(
      id,
      technicianId,
      `${ticket.assignedTo!.firstName} ${ticket.assignedTo!.lastName}`
    );

    // Notify the ticket creator that it's been assigned
    await notify(
      ticket.createdById,
      "TICKET_ASSIGNED",
      "Ticket assigned",
      `Your ticket "${ticket.subject}" (${ticket.ticketNumber}) has been assigned to ${ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : "a technician"}.`,
      ticket.id
    );

    return formatTicket(ticket);
  }

  /**
   * Claim (réclamer) un ticket non assigné - Technician self-assignment
   */
  async claim(id: string, technicianId: string): Promise<TicketResponse> {
    console.log("=== CLAIM SERVICE START ===");
    console.log("Ticket ID:", id);
    console.log("Technician ID:", technicianId);
    
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      console.log("❌ Error: Ticket not found");
      throw new ApiError(404, "Ticket not found");
    }
    
    console.log("Ticket found:");
    console.log("  - Number:", ticket.ticketNumber);
    console.log("  - Status:", ticket.status);
    console.log("  - Currently assigned to:", ticket.assignedToId);

    // Vérifier que le ticket n'est pas déjà assigné
    if (ticket.assignedToId) {
      console.log("❌ Error: Ticket already assigned to:", ticket.assignedToId);
      throw new ApiError(400, "Ticket is already assigned");
    }

    // Vérifier que le ticket est OPEN
    if (ticket.status !== "OPEN") {
      console.log("❌ Error: Ticket status is not OPEN, current status:", ticket.status);
      throw new ApiError(400, "Only OPEN tickets can be claimed");
    }

    console.log("✅ Validation passed, updating ticket...");
    
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { assignedToId: technicianId, status: "ASSIGNED" },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    console.log("✅ Ticket updated successfully");
    console.log("  - New status:", updatedTicket.status);
    console.log("  - Assigned to:", updatedTicket.assignedTo?.firstName, updatedTicket.assignedTo?.lastName);

    // Enregistrer la prise en charge dans l'historique
    await historyService.trackClaim(
      id,
      technicianId,
      `${updatedTicket.assignedTo!.firstName} ${updatedTicket.assignedTo!.lastName}`
    );

    // Notifier le créateur du ticket
    await notify(
      updatedTicket.createdById,
      "TICKET_ASSIGNED",
      "Ticket assigned",
      `Your ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) has been claimed by ${updatedTicket.assignedTo ? `${updatedTicket.assignedTo.firstName} ${updatedTicket.assignedTo.lastName}` : "a technician"}.`,
      updatedTicket.id
    );

    console.log("=== CLAIM SERVICE END (SUCCESS) ===");
    return formatTicket(updatedTicket);
  }

  /**
   * Prendre en charge un ticket (ASSIGNED → IN_PROGRESS)
   */
  async startWork(id: string, technicianId: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Vérifier que le ticket est ASSIGNED
    if (ticket.status !== "ASSIGNED") {
      throw new ApiError(400, "Only ASSIGNED tickets can be started");
    }

    // Vérifier que c'est le technicien assigné
    if (ticket.assignedToId !== technicianId) {
      throw new ApiError(403, "Only the assigned technician can start work on this ticket");
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        firstResponseAt: new Date(), // ✅ NOUVEAU : Tracker première réponse
      },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer dans l'historique
    await historyService.trackStatusChange(
      id,
      technicianId,
      "ASSIGNED",
      "IN_PROGRESS",
      "Technician started working on the ticket"
    );

    // Notifier le créateur
    await notify(
      updatedTicket.createdById,
      "TICKET_UPDATED",
      "Work started on your ticket",
      `${updatedTicket.assignedTo!.firstName} ${updatedTicket.assignedTo!.lastName} started working on ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}).`,
      updatedTicket.id
    );

    return formatTicket(updatedTicket);
  }

  /**
   * Mettre un ticket en attente (IN_PROGRESS → WAITING_FOR_USER)
   */
  async putOnHold(id: string, technicianId: string, reason?: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Vérifier que le ticket est IN_PROGRESS
    if (ticket.status !== "IN_PROGRESS") {
      throw new ApiError(400, "Only IN_PROGRESS tickets can be put on hold");
    }

    // Vérifier que c'est le technicien assigné
    if (ticket.assignedToId !== technicianId) {
      throw new ApiError(403, "Only the assigned technician can put this ticket on hold");
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: "WAITING_FOR_USER" },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer dans l'historique
    await historyService.trackPutOnHold(id, technicianId, reason);

    // Notifier le créateur
    await notify(
      updatedTicket.createdById,
      "TICKET_UPDATED",
      "Action required on your ticket",
      `Your ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) is waiting for your response. ${reason || ""}`,
      updatedTicket.id
    );

    return formatTicket(updatedTicket);
  }

  /**
   * Reprendre un ticket en attente (WAITING_FOR_USER → IN_PROGRESS)
   */
  async resumeTicket(id: string, userId: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Vérifier que le ticket est WAITING_FOR_USER
    if (ticket.status !== "WAITING_FOR_USER") {
      throw new ApiError(400, "Only tickets waiting for user can be resumed");
    }

    // Vérifier que c'est le créateur ou le technicien assigné
    if (ticket.createdById !== userId && ticket.assignedToId !== userId) {
      throw new ApiError(403, "Only the ticket creator or assigned technician can resume this ticket");
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer dans l'historique
    await historyService.trackResume(id, userId);

    // Notifier l'autre partie (si c'est le créateur qui reprend, notifier le technicien et vice-versa)
    const notifyUserId = userId === ticket.createdById ? ticket.assignedToId : ticket.createdById;
    if (notifyUserId) {
      await notify(
        notifyUserId,
        "TICKET_UPDATED",
        "Ticket resumed",
        `Ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) has been resumed and is back in progress.`,
        updatedTicket.id
      );
    }

    return formatTicket(updatedTicket);
  }

  /**
   * Résoudre un ticket (IN_PROGRESS → RESOLVED)
   */
  async resolveTicket(id: string, technicianId: string, resolution: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Vérifier que le ticket est IN_PROGRESS
    if (ticket.status !== "IN_PROGRESS") {
      throw new ApiError(400, "Only IN_PROGRESS tickets can be resolved");
    }

    // Vérifier que c'est le technicien assigné
    if (ticket.assignedToId !== technicianId) {
      throw new ApiError(403, "Only the assigned technician can resolve this ticket");
    }

    // ✅ NOUVEAU : Calculer le temps de résolution
    const resolutionTime = Math.floor(
      (new Date().getTime() - new Date(ticket.createdAt).getTime()) / 60000
    );

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolutionTime, // ✅ NOUVEAU
      },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer dans l'historique
    await historyService.trackResolution(id, technicianId, resolution);

    // Notifier le créateur
    await notify(
      updatedTicket.createdById,
      "TICKET_RESOLVED",
      "Ticket resolved",
      `Your ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) has been resolved. Please confirm and rate the service.`,
      updatedTicket.id
    );

    return formatTicket(updatedTicket);
  }

  /**
   * Annuler un ticket (Employee seulement, si OPEN ou ASSIGNED ou IN_PROGRESS)
   */
  async cancel(id: string, userId: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Vérifier que l'utilisateur est le créateur
    if (ticket.createdById !== userId) {
      throw new ApiError(403, "You can only cancel your own tickets");
    }

    // Vérifier que le ticket peut être annulé
    if (!["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(ticket.status)) {
      throw new ApiError(400, "Ticket can only be cancelled if it's OPEN, ASSIGNED or IN_PROGRESS");
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: "CLOSED", closedAt: new Date() },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer dans l'historique
    await historyService.trackCancellation(id, userId);

    // Notifier le technicien assigné (s'il y en a un)
    if (updatedTicket.assignedToId) {
      await notify(
        updatedTicket.assignedToId,
        "TICKET_UPDATED",
        "Ticket cancelled by user",
        `Ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) has been cancelled by the user.`,
        updatedTicket.id
      );
    }

    return formatTicket(updatedTicket);
  }

  /**
   * Rouvrir un ticket (Technician/Admin seulement)
   */
  async reopen(id: string, userId: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Vérifier que le ticket est fermé
    if (ticket.status !== "CLOSED") {
      throw new ApiError(400, "Only closed tickets can be reopened");
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: ticket.assignedToId ? "IN_PROGRESS" : "OPEN",
        closedAt: null,
        resolvedAt: null,
      },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer dans l'historique
    await historyService.trackReopen(id, userId);

    // Notifier le créateur du ticket
    await notify(
      updatedTicket.createdById,
      "TICKET_UPDATED",
      "Ticket reopened",
      `Your ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}) has been reopened and is being worked on.`,
      updatedTicket.id
    );

    return formatTicket(updatedTicket);
  }

  /**
   * Confirmer la résolution (Employee → RESOLVED to CLOSED)
   */
  async confirmResolution(id: string, userId: string): Promise<TicketResponse> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Vérifier que l'utilisateur est le créateur
    if (ticket.createdById !== userId) {
      throw new ApiError(403, "You can only confirm resolution of your own tickets");
    }

    // Vérifier que le ticket est RESOLVED
    if (ticket.status !== "RESOLVED") {
      throw new ApiError(400, "Only resolved tickets can be confirmed");
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status: "CLOSED", closedAt: new Date() },
      include: { createdBy: true, assignedTo: true, category: true },
    });

    // Enregistrer dans l'historique
    await historyService.trackClosure(id, userId, "Resolution confirmed by user");

    // Notifier le technicien assigné
    if (updatedTicket.assignedToId) {
      await notify(
        updatedTicket.assignedToId,
        "TICKET_CLOSED",
        "Ticket confirmed and closed",
        `User confirmed resolution of ticket "${updatedTicket.subject}" (${updatedTicket.ticketNumber}).`,
        updatedTicket.id
      );
    }

    return formatTicket(updatedTicket);
  }

  /**
   * Supprimer un ticket (Admin/Super Admin seulement)
   */
  async deleteTicket(id: string): Promise<void> {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Supprimer toutes les relations en cascade dans l'ordre correct
    
    // 1. Supprimer les commentaires
    await prisma.ticketComment.deleteMany({
      where: { ticketId: id },
    });

    // 2. Supprimer les notifications
    await prisma.notification.deleteMany({
      where: { ticketId: id },
    });

    // 3. Supprimer les attachments (pièces jointes)
    await prisma.attachment.deleteMany({
      where: { ticketId: id },
    });

    // 4. Supprimer les ratings (évaluations)
    await prisma.rating.deleteMany({
      where: { ticketId: id },
    });

    // 5. Supprimer l'historique
    await prisma.ticketHistory.deleteMany({
      where: { ticketId: id },
    });

    // 6. Supprimer le SLA tracking
    await prisma.sLA.deleteMany({
      where: { ticketId: id },
    });

    // 7. Enfin, supprimer le ticket
    await prisma.ticket.delete({
      where: { id },
    });
    
    logger.info(`[TICKET] Ticket ${id} deleted successfully with all relations`);
  }
}

export const ticketsService = new TicketsService();

