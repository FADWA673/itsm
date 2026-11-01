/**
 * Controller Categories — Gestion des requêtes HTTP pour les catégories
 */

import { Request, Response, NextFunction } from "express";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./categories.types";

const service = new CategoriesService();

/**
 * GET /api/v1/ticket-categories
 * Récupérer toutes les catégories de l'organisation
 */
export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { organizationId } = req.user!;
    const includeInactive = req.query.includeInactive === "true";

    const categories = await service.findAll(organizationId, includeInactive);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/ticket-categories/root
 * Récupérer les catégories racines (sans parent)
 */
export const getRootCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { organizationId } = req.user!;

    const categories = await service.findRootCategories(organizationId);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/ticket-categories/:id
 * Récupérer une catégorie par ID
 */
export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    const category = await service.findById(id, organizationId);

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/ticket-categories/:id/subcategories
 * Récupérer les sous-catégories d'une catégorie
 */
export const getSubcategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    const subcategories = await service.findSubcategories(id, organizationId);

    res.json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/ticket-categories
 * Créer une nouvelle catégorie (Admin/Manager)
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { organizationId } = req.user!;
    const data: CreateCategoryDTO = req.body;

    const category = await service.create(data, organizationId);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/ticket-categories/:id
 * Mettre à jour une catégorie (Admin/Manager)
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;
    const data: UpdateCategoryDTO = req.body;

    const category = await service.update(id, data, organizationId);

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/ticket-categories/:id
 * Supprimer une catégorie (Admin/Manager)
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user!;

    await service.delete(id, organizationId);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
