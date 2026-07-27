import { Organization, OrganizationStatus, Prisma } from "@prisma/client";
import { BaseRepository } from "./base.repository";

/**
 * Repository pour les opérations CRUD sur les organisations.
 */
export class OrganizationRepository extends BaseRepository {
  /**
   * Trouve une organisation par son ID.
   */
  async findById(id: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }

  /**
   * Trouve une organisation par son slug unique.
   */
  async findBySlug(slug: string): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: { slug },
    });
  }

  /**
   * Crée une nouvelle organisation.
   */
  async create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return this.prisma.organization.create({ data });
  }

  /**
   * Met à jour une organisation.
   */
  async update(
    id: string,
    data: Prisma.OrganizationUpdateInput
  ): Promise<Organization> {
    return this.prisma.organization.update({ where: { id }, data });
  }

  /**
   * Soft delete d'une organisation.
   */
  async softDelete(id: string): Promise<Organization> {
    return this.prisma.organization.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: OrganizationStatus.INACTIVE,
      },
    });
  }

  /**
   * Vérifie si un slug est déjà utilisé.
   */
  async slugExists(slug: string): Promise<boolean> {
    const count = await this.prisma.organization.count({ where: { slug } });
    return count > 0;
  }
}

// Instance singleton exportée
export const organizationRepository = new OrganizationRepository();
