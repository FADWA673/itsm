import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";

interface CreateRatingRequest {
  rating: number;
  comment?: string;
}

interface RatingResponse {
  id: string;
  ticketId: string;
  rating: number;
  comment: string | null;
  createdById: string;
  createdByName: string;
  createdAt: string;
}

function formatRating(rating: {
  id: string;
  ticketId: string;
  rating: number;
  comment: string | null;
  createdById: string;
  createdAt: Date;
  createdBy: { firstName: string; lastName: string };
}): RatingResponse {
  return {
    id: rating.id,
    ticketId: rating.ticketId,
    rating: rating.rating,
    comment: rating.comment,
    createdById: rating.createdById,
    createdByName: `${rating.createdBy.firstName} ${rating.createdBy.lastName}`,
    createdAt: rating.createdAt.toISOString(),
  };
}

export class RatingsService {
  /**
   * Créer une note de satisfaction pour un ticket
   * @param ticketId ID du ticket
   * @param userId ID de l'utilisateur qui note
   * @param data Note (1-5) et commentaire optionnel
   */
  async createRating(ticketId: string, userId: string, data: CreateRatingRequest): Promise<RatingResponse> {
    // 1. Vérifier que le ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { rating: true },
    });

    if (!ticket) {
      throw new ApiError(404, "Ticket not found");
    }

    // 2. Vérifier que l'utilisateur est le créateur du ticket
    if (ticket.createdById !== userId) {
      throw new ApiError(403, "You can only rate your own tickets");
    }

    // 3. Vérifier que le ticket est fermé (CLOSED)
    if (ticket.status !== "CLOSED") {
      throw new ApiError(400, "You can only rate closed tickets");
    }

    // 4. Vérifier que le ticket n'a pas déjà été noté
    if (ticket.rating) {
      throw new ApiError(400, "This ticket has already been rated");
    }

    // 5. Valider la note (1 à 5)
    if (data.rating < 1 || data.rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // 6. Créer la note
    const rating = await prisma.ticketRating.create({
      data: {
        ticketId,
        createdById: userId,
        rating: data.rating,
        comment: data.comment || null,
      },
      include: {
        createdBy: true,
      },
    });

    // 7. Notifier le technicien assigné (si existe)
    if (ticket.assignedToId) {
      const stars = "⭐".repeat(data.rating);
      await prisma.notification.create({
        data: {
          userId: ticket.assignedToId,
          type: "TICKET_UPDATED",
          title: "Nouvelle note de satisfaction",
          message: `${rating.createdBy.firstName} a noté le ticket ${ticket.ticketNumber} : ${stars} (${data.rating}/5)`,
          ticketId: ticket.id,
        },
      });
    }

    return formatRating(rating);
  }

  /**
   * Récupérer la note d'un ticket
   * @param ticketId ID du ticket
   */
  async getRatingByTicket(ticketId: string): Promise<RatingResponse | null> {
    const rating = await prisma.ticketRating.findUnique({
      where: { ticketId },
      include: {
        createdBy: true,
      },
    });

    if (!rating) {
      return null;
    }

    return formatRating(rating);
  }

  /**
   * Récupérer les statistiques de satisfaction
   * @param organizationId ID de l'organisation
   */
  async getStatistics(organizationId: string) {
    // Récupérer toutes les notes de l'organisation
    const ratings = await prisma.ticketRating.findMany({
      where: {
        ticket: {
          organizationId,
        },
      },
      select: {
        rating: true,
      },
    });

    if (ratings.length === 0) {
      return {
        totalRatings: 0,
        averageRating: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
        percentages: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    // Calculer la moyenne
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / ratings.length;

    // Calculer la distribution
    const distribution = {
      1: ratings.filter((r) => r.rating === 1).length,
      2: ratings.filter((r) => r.rating === 2).length,
      3: ratings.filter((r) => r.rating === 3).length,
      4: ratings.filter((r) => r.rating === 4).length,
      5: ratings.filter((r) => r.rating === 5).length,
    };

    // Calculer les pourcentages
    const percentages = {
      1: Math.round((distribution[1] / ratings.length) * 100),
      2: Math.round((distribution[2] / ratings.length) * 100),
      3: Math.round((distribution[3] / ratings.length) * 100),
      4: Math.round((distribution[4] / ratings.length) * 100),
      5: Math.round((distribution[5] / ratings.length) * 100),
    };

    return {
      totalRatings: ratings.length,
      averageRating: Math.round(average * 10) / 10, // Arrondi à 1 décimale
      distribution,
      percentages,
    };
  }

  /**
   * Récupérer les statistiques par technicien
   * @param organizationId ID de l'organisation
   */
  async getStatisticsByTechnician(organizationId: string) {
    const ratings = await prisma.ticketRating.findMany({
      where: {
        ticket: {
          organizationId,
          assignedToId: { not: null },
        },
      },
      include: {
        ticket: {
          select: {
            assignedToId: true,
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Grouper par technicien
    const byTechnician: Record<string, { name: string; ratings: number[]; count: number; average: number }> = {};

    ratings.forEach((rating) => {
      if (!rating.ticket.assignedTo) return;

      const techId = rating.ticket.assignedTo.id;
      const techName = `${rating.ticket.assignedTo.firstName} ${rating.ticket.assignedTo.lastName}`;

      if (!byTechnician[techId]) {
        byTechnician[techId] = {
          name: techName,
          ratings: [],
          count: 0,
          average: 0,
        };
      }

      byTechnician[techId].ratings.push(rating.rating);
      byTechnician[techId].count++;
    });

    // Calculer les moyennes
    Object.keys(byTechnician).forEach((techId) => {
      const tech = byTechnician[techId];
      const sum = tech.ratings.reduce((acc, r) => acc + r, 0);
      tech.average = Math.round((sum / tech.count) * 10) / 10;
    });

    // Convertir en array et trier par moyenne décroissante
    return Object.entries(byTechnician)
      .map(([id, data]) => ({
        technicianId: id,
        technicianName: data.name,
        totalTickets: data.count,
        averageRating: data.average,
      }))
      .sort((a, b) => b.averageRating - a.averageRating);
  }
}

export const ratingsService = new RatingsService();
