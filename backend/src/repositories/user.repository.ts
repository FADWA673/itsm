import { User, UserRole, UserStatus, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

/**
 * Repository pour les opérations CRUD sur les utilisateurs.
 * Toute la logique d'accès DB liée aux users passe par ici.
 */
export class UserRepository extends BaseRepository {
  /**
   * Trouve un utilisateur par son email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Trouve un utilisateur par son ID.
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Liste les utilisateurs d'une organisation avec pagination.
   */
  async findByOrganization(
    organizationId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: { organizationId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({
        where: { organizationId, deletedAt: null },
      }),
    ]);

    return { users, total };
  }

  /**
   * Crée un nouvel utilisateur.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * Met à jour un utilisateur.
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  /**
   * Soft delete — marque deletedAt sans supprimer la ligne.
   */
  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: UserStatus.INACTIVE },
    });
  }

  /**
   * Vérifie si un email est déjà utilisé.
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  /**
   * Compte les admins actifs d'une organisation.
   */
  async countAdmins(organizationId: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        organizationId,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
    });
  }
}

// Instance singleton exportée
export const userRepository = new UserRepository();
