import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

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

export class TicketHistoryService {
  /**
   * Créer une entrée d'historique
   */
  async createHistoryEntry(
    ticketId: string,
    userId: string,
    action: string,
    oldValue?: string | null,
    newValue?: string | null,
    comment?: string | null
  ): Promise<void> {
    await prisma.ticketHistory.create({
      data: {
        ticketId,
        userId,
        action,
        oldValue: oldValue || null,
        newValue: newValue || null,
        comment: comment || null,
      },
    });
  }

  /**
   * Récupérer l'historique complet d'un ticket
   */
  async getTicketHistory(ticketId: string): Promise<TicketHistoryEntry[]> {
    const history = await prisma.ticketHistory.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return history.map((entry) => ({
      id: entry.id,
      action: entry.action,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      comment: entry.comment,
      createdAt: entry.createdAt.toISOString(),
      user: entry.user,
    }));
  }

  /**
   * Enregistrer un changement de statut
   */
  async trackStatusChange(
    ticketId: string,
    userId: string,
    oldStatus: string,
    newStatus: string,
    comment?: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "STATUS_CHANGED",
      oldStatus,
      newStatus,
      comment || `Status changed from ${oldStatus} to ${newStatus}`
    );
  }

  /**
   * Enregistrer une assignation
   */
  async trackAssignment(
    ticketId: string,
    userId: string,
    technicianName: string,
    comment?: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "ASSIGNED",
      null,
      technicianName,
      comment || `Ticket assigned to ${technicianName}`
    );
  }

  /**
   * Enregistrer la prise en charge (claim)
   */
  async trackClaim(
    ticketId: string,
    userId: string,
    technicianName: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "CLAIMED",
      null,
      technicianName,
      `Ticket claimed by ${technicianName}`
    );
  }

  /**
   * Enregistrer la mise en attente
   */
  async trackPutOnHold(
    ticketId: string,
    userId: string,
    reason?: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "PUT_ON_HOLD",
      null,
      null,
      reason || "Ticket put on hold, waiting for user response"
    );
  }

  /**
   * Enregistrer la reprise
   */
  async trackResume(
    ticketId: string,
    userId: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "RESUMED",
      null,
      null,
      "Ticket resumed and back in progress"
    );
  }

  /**
   * Enregistrer la résolution
   */
  async trackResolution(
    ticketId: string,
    userId: string,
    resolution: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "RESOLVED",
      null,
      null,
      resolution
    );
  }

  /**
   * Enregistrer la fermeture
   */
  async trackClosure(
    ticketId: string,
    userId: string,
    reason?: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "CLOSED",
      null,
      null,
      reason || "Ticket closed"
    );
  }

  /**
   * Enregistrer la création du ticket
   */
  async trackCreation(
    ticketId: string,
    userId: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "CREATED",
      null,
      null,
      "Ticket created"
    );
  }

  /**
   * Enregistrer la réouverture
   */
  async trackReopen(
    ticketId: string,
    userId: string,
    reason?: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "REOPENED",
      null,
      null,
      reason || "Ticket reopened"
    );
  }

  /**
   * Enregistrer l'annulation
   */
  async trackCancellation(
    ticketId: string,
    userId: string,
    reason?: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "CANCELLED",
      null,
      null,
      reason || "Ticket cancelled by user"
    );
  }

  /**
   * Enregistrer un commentaire ajouté
   */
  async trackComment(
    ticketId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    await this.createHistoryEntry(
      ticketId,
      userId,
      "COMMENT_ADDED",
      null,
      null,
      `${userName} added a comment`
    );
  }
}

export const historyService = new TicketHistoryService();
