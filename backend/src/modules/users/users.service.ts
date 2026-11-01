import { prisma } from "../../config/database";
import { hashPassword, comparePassword, isPasswordStrong } from "../../utils/password";
import { ApiError } from "../../utils/ApiError";
import type { CreateUserRequest, UserResponse, UpdateProfileRequest } from "./users.types";

function formatUser(user: {
  id: string; email: string; firstName: string; lastName: string;
  role: string; status: string; lastLoginAt: Date | null;
  createdAt: Date; organizationId: string;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    organizationId: user.organizationId,
  };
}

export class UsersService {
  /**
   * Récupère tous les utilisateurs de l'organisation.
   */
  async findAll(organizationId: string): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return users.map(formatUser);
  }

  /**
   * Crée un nouvel utilisateur.
   */
  async create(data: CreateUserRequest, creatorOrgId: string): Promise<UserResponse> {
    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ApiError(409, `Email ${data.email} is already in use`);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DEPT_MANAGER" | "TECHNICIAN" | "USER",
        status: "ACTIVE",
        organizationId: data.organizationId || creatorOrgId,
      },
    });

    return formatUser(user);
  }

  /**
   * Met à jour un utilisateur (nom, rôle, statut).
   */
  async update(id: string, data: Partial<{ firstName: string; lastName: string; role: string; status: string }>): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role as "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DEPT_MANAGER" | "TECHNICIAN" | "USER" }),
        ...(data.status && { status: data.status as "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" }),
      },
    });
    return formatUser(user);
  }

  /**
   * Désactive un utilisateur (soft delete via status).
   */
  async deactivate(id: string): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    return formatUser(user);
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur (par l'admin).
   */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  /**
   * Supprime définitivement un utilisateur.
   * Gère toutes les relations en cascade selon le schéma Prisma.
   */
  async delete(id: string): Promise<void> {
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, "User not found");

    // Supprimer/mettre à jour toutes les relations en cascade dans le bon ordre

    // 1. Notifications
    await prisma.notification.deleteMany({
      where: { userId: id },
    });

    // 2. Commentaires de tickets (authorId dans schema)
    await prisma.ticketComment.deleteMany({
      where: { authorId: id },
    });

    // 3. Historique des tickets (userId dans schema)
    await prisma.ticketHistory.deleteMany({
      where: { userId: id },
    });

    // 4. Ratings (createdById, pas userId)
    await prisma.ticketRating.deleteMany({
      where: { createdById: id },
    });

    // 5. Attachments
    await prisma.attachment.deleteMany({
      where: { uploadedById: id },
    });

    // 6. Asset Histories (performedById dans schema)
    await prisma.assetHistory.deleteMany({
      where: { performedById: id },
    });

    // 7. Tickets créés par l'utilisateur - SUPPRIMER EN CASCADE
    // On doit d'abord supprimer toutes les relations des tickets
    const userTickets = await prisma.ticket.findMany({
      where: { createdById: id },
      select: { id: true },
    });

    const userTicketIds = userTickets.map(t => t.id);

    if (userTicketIds.length > 0) {
      // 7a. Notifications des tickets
      await prisma.notification.deleteMany({
        where: { ticketId: { in: userTicketIds } },
      });

      // 7b. Commentaires des tickets
      await prisma.ticketComment.deleteMany({
        where: { ticketId: { in: userTicketIds } },
      });

      // 7c. Historique des tickets
      await prisma.ticketHistory.deleteMany({
        where: { ticketId: { in: userTicketIds } },
      });

      // 7d. Ratings des tickets
      await prisma.ticketRating.deleteMany({
        where: { ticketId: { in: userTicketIds } },
      });

      // 7e. Attachments des tickets
      await prisma.attachment.deleteMany({
        where: { ticketId: { in: userTicketIds } },
      });

      // 7f. Enfin, supprimer les tickets eux-mêmes
      await prisma.ticket.deleteMany({
        where: { id: { in: userTicketIds } },
      });
    }

    // 8. Articles KB créés (SUPPRIMER car authorId est required)
    await prisma.kBArticle.deleteMany({
      where: { authorId: id },
    });

    // 9. Articles KB reviewés (mettre reviewer à null)
    await prisma.kBArticle.updateMany({
      where: { reviewedById: id },
      data: { reviewedById: null },
    });

    // 10. Tickets assignés à l'utilisateur (mettre assignedTo à null et statut OPEN)
    await prisma.ticket.updateMany({
      where: { assignedToId: id },
      data: { assignedToId: null, status: "OPEN" },
    });

    // 11. Assets assignés (mettre assignedTo à null)
    await prisma.asset.updateMany({
      where: { assignedToId: id },
      data: { assignedToId: null },
    });

    // 12. Enfin, supprimer l'utilisateur
    await prisma.user.delete({
      where: { id },
    });

    console.log(`[USER] User ${id} (${user.email}) deleted successfully with all relations`);
  }

  // ─── Profile (self-service) ────────────────────────────────────────────────

  /**
   * Récupère le profil de l'utilisateur connecté (avec le nom de l'organisation).
   */
  async getMe(id: string): Promise<UserResponse & { phone: string | null; organizationName: string }> {
    const user = await prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: { organization: { select: { name: true } } },
    });
    if (!user) throw new ApiError(404, "User not found");
    return {
      ...formatUser(user),
      phone: user.phone ?? null,
      organizationName: user.organization.name,
    };
  }

  /**
   * Met à jour le profil de l'utilisateur connecté (firstName, lastName, phone).
   */
  async updateMe(id: string, data: UpdateProfileRequest): Promise<UserResponse & { phone: string | null }> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    });
    return { ...formatUser(user), phone: user.phone ?? null };
  }

  /**
   * Change le mot de passe de l'utilisateur connecté.
   * Vérifie l'ancien mot de passe avant de l'écraser.
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError(404, "User not found");

    const isValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isValid) throw new ApiError(401, "Current password is incorrect");

    if (!isPasswordStrong(newPassword)) {
      throw new ApiError(400, "Password must be at least 8 characters with uppercase, lowercase, number and special character.");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}

export const usersService = new UsersService();
