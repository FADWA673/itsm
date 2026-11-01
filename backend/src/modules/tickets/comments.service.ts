import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { notify } from "../../utils/notify";

export interface CommentResponse {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  ticketId: string;
  createdAt: string;
  updatedAt: string;
}

function formatComment(c: {
  id: string;
  content: string;
  authorId: string;
  author: { firstName: string; lastName: string; role: string };
  ticketId: string;
  createdAt: Date;
  updatedAt: Date;
}): CommentResponse {
  return {
    id: c.id,
    content: c.content,
    authorId: c.authorId,
    authorName: `${c.author.firstName} ${c.author.lastName}`,
    authorRole: c.author.role,
    ticketId: c.ticketId,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export class CommentsService {
  /**
   * Récupère tous les commentaires d'un ticket.
   * Vérifie que le demandeur appartient à la même organisation que le ticket.
   */
  async findByTicket(ticketId: string, requesterId: string): Promise<CommentResponse[]> {
    // Verify ticket exists and requester has access
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, createdById: true, organizationId: true },
    });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { organizationId: true, role: true },
    });
    if (!requester) throw new ApiError(401, "Authentication required");

    // Employee can only see their own tickets; admins/techs see all in org
    const isPrivileged = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEPT_MANAGER", "TECHNICIAN"].includes(requester.role);
    if (!isPrivileged && ticket.createdById !== requesterId) {
      throw new ApiError(403, "Access denied");
    }

    const comments = await prisma.ticketComment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
    });

    return comments.map(formatComment);
  }

  /**
   * Ajoute un commentaire à un ticket.
   * Notifie le créateur du ticket si c'est un technicien qui répond.
   */
  async create(
    ticketId: string,
    authorId: string,
    content: string
  ): Promise<CommentResponse> {
    if (!content.trim()) throw new ApiError(400, "Content cannot be empty");

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, createdById: true, subject: true, ticketNumber: true, status: true },
    });
    if (!ticket) throw new ApiError(404, "Ticket not found");

    // Only allow comments on non-closed tickets
    if (ticket.status === "CLOSED") {
      throw new ApiError(400, "Cannot add comments to a closed ticket");
    }

    const comment = await prisma.ticketComment.create({
      data: { content: content.trim(), authorId, ticketId },
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
    });

    const author = comment.author;
    const isPrivileged = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEPT_MANAGER", "TECHNICIAN"].includes(author.role);

    // If a technician/admin comments → notify the ticket creator
    if (isPrivileged && ticket.createdById !== authorId) {
      await notify(
        ticket.createdById,
        "TICKET_UPDATED",
        "New comment on your ticket",
        `${author.firstName} ${author.lastName} added a comment to "${ticket.subject}" (${ticket.ticketNumber}).`,
        ticket.id
      );
    }

    return formatComment(comment);
  }
}

export const commentsService = new CommentsService();
