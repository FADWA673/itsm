/**
 * Service Categories — Gestion des catégories de tickets
 * CRUD + logique métier pour les catégories hiérarchiques
 */

import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { CreateCategoryDTO, UpdateCategoryDTO, CategoryResponse } from "./categories.types";

export class CategoriesService {
  /**
   * Récupérer toutes les catégories d'une organisation
   * @param organizationId - ID de l'organisation
   * @param includeInactive - Inclure les catégories désactivées
   */
  async findAll(organizationId: string, includeInactive = false): Promise<CategoryResponse[]> {
    const categories = await prisma.ticketCategory.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { active: true }),
      },
      include: {
        parent: true,
        subcategories: {
          where: includeInactive ? {} : { active: true },
        },
        _count: {
          select: {
            tickets: true,
            subcategories: true,
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { name: "asc" },
      ],
    });

    return categories;
  }

  /**
   * Récupérer une catégorie par ID
   * @param id - ID de la catégorie
   * @param organizationId - ID de l'organisation
   */
  async findById(id: string, organizationId: string): Promise<CategoryResponse> {
    const category = await prisma.ticketCategory.findFirst({
      where: { id, organizationId },
      include: {
        parent: true,
        subcategories: {
          where: { active: true },
        },
        _count: {
          select: {
            tickets: true,
            subcategories: true,
          },
        },
      },
    });

    if (!category) {
      throw new ApiError("Category not found", 404);
    }

    return category;
  }

  /**
   * Créer une nouvelle catégorie
   * @param data - Données de la catégorie
   * @param organizationId - ID de l'organisation
   */
  async create(data: CreateCategoryDTO, organizationId: string): Promise<CategoryResponse> {
    // Vérifier que le parent existe (si spécifié)
    if (data.parentId) {
      const parent = await prisma.ticketCategory.findFirst({
        where: { id: data.parentId, organizationId },
      });

      if (!parent) {
        throw new ApiError("Parent category not found", 404);
      }
    }

    // Vérifier unicité du nom dans l'organisation
    const existing = await prisma.ticketCategory.findFirst({
      where: {
        name: data.name,
        organizationId,
        parentId: data.parentId || null,
      },
    });

    if (existing) {
      throw new ApiError("A category with this name already exists", 400);
    }

    const category = await prisma.ticketCategory.create({
      data: {
        ...data,
        organizationId,
        displayOrder: data.displayOrder || 0,
      },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: {
            tickets: true,
            subcategories: true,
          },
        },
      },
    });

    return category;
  }

  /**
   * Mettre à jour une catégorie
   * @param id - ID de la catégorie
   * @param data - Données de mise à jour
   * @param organizationId - ID de l'organisation
   */
  async update(
    id: string,
    data: UpdateCategoryDTO,
    organizationId: string
  ): Promise<CategoryResponse> {
    // Vérifier que la catégorie existe
    const category = await this.findById(id, organizationId);

    // Vérifier que le parent existe (si spécifié)
    if (data.parentId) {
      if (data.parentId === id) {
        throw new ApiError("A category cannot be its own parent", 400);
      }

      const parent = await prisma.ticketCategory.findFirst({
        where: { id: data.parentId, organizationId },
      });

      if (!parent) {
        throw new ApiError("Parent category not found", 404);
      }

      // Vérifier qu'on ne crée pas de cycle (parent → enfant → parent)
      if (parent.parentId === id) {
        throw new ApiError("Cannot create circular parent-child relationship", 400);
      }
    }

    // Vérifier unicité du nom (si changement de nom)
    if (data.name && data.name !== category.name) {
      const existing = await prisma.ticketCategory.findFirst({
        where: {
          name: data.name,
          organizationId,
          id: { not: id },
          parentId: data.parentId !== undefined ? data.parentId : category.parentId,
        },
      });

      if (existing) {
        throw new ApiError("A category with this name already exists", 400);
      }
    }

    const updated = await prisma.ticketCategory.update({
      where: { id },
      data,
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: {
            tickets: true,
            subcategories: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Supprimer une catégorie
   * @param id - ID de la catégorie
   * @param organizationId - ID de l'organisation
   */
  async delete(id: string, organizationId: string): Promise<void> {
    const category = await this.findById(id, organizationId);

    // Vérifier qu'il n'y a pas de tickets associés
    if (category._count && category._count.tickets > 0) {
      throw new ApiError(
        `Cannot delete category with ${category._count.tickets} associated tickets`,
        400
      );
    }

    // Vérifier qu'il n'y a pas de sous-catégories
    if (category._count && category._count.subcategories > 0) {
      throw new ApiError(
        `Cannot delete category with ${category._count.subcategories} subcategories`,
        400
      );
    }

    await prisma.ticketCategory.delete({
      where: { id },
    });
  }

  /**
   * Récupérer les catégories racines (sans parent)
   * @param organizationId - ID de l'organisation
   */
  async findRootCategories(organizationId: string): Promise<CategoryResponse[]> {
    const categories = await prisma.ticketCategory.findMany({
      where: {
        organizationId,
        parentId: null,
        active: true,
      },
      include: {
        subcategories: {
          where: { active: true },
          orderBy: [
            { displayOrder: "asc" },
            { name: "asc" },
          ],
        },
        _count: {
          select: {
            tickets: true,
            subcategories: true,
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { name: "asc" },
      ],
    });

    return categories;
  }

  /**
   * Récupérer les sous-catégories d'une catégorie
   * @param parentId - ID de la catégorie parente
   * @param organizationId - ID de l'organisation
   */
  async findSubcategories(parentId: string, organizationId: string): Promise<CategoryResponse[]> {
    // Vérifier que la catégorie parent existe
    await this.findById(parentId, organizationId);

    const subcategories = await prisma.ticketCategory.findMany({
      where: {
        parentId,
        organizationId,
        active: true,
      },
      include: {
        _count: {
          select: {
            tickets: true,
            subcategories: true,
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { name: "asc" },
      ],
    });

    return subcategories;
  }
}

