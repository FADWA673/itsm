/**
 * Service Frontend — Ticket Categories
 * Gestion des catégories de tickets (API calls)
 */

import api from './api';

export interface TicketCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  active: boolean;
  displayOrder: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  parent?: TicketCategory | null;
  subcategories?: TicketCategory[];
  _count?: {
    tickets: number;
    subcategories: number;
  };
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  displayOrder?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  active?: boolean;
  displayOrder?: number;
}

/**
 * Récupérer toutes les catégories
 */
export const getAllCategories = async (includeInactive = false): Promise<TicketCategory[]> => {
  const response = await api.get('/ticket-categories', {
    params: { includeInactive },
  });
  return response.data.data;
};

/**
 * Récupérer les catégories racines (sans parent)
 */
export const getRootCategories = async (): Promise<TicketCategory[]> => {
  const response = await api.get('/ticket-categories/root');
  return response.data.data;
};

/**
 * Récupérer une catégorie par ID
 */
export const getCategoryById = async (id: string): Promise<TicketCategory> => {
  const response = await api.get(`/ticket-categories/${id}`);
  return response.data.data;
};

/**
 * Récupérer les sous-catégories d'une catégorie
 */
export const getSubcategories = async (parentId: string): Promise<TicketCategory[]> => {
  const response = await api.get(`/ticket-categories/${parentId}/subcategories`);
  return response.data.data;
};

/**
 * Créer une nouvelle catégorie (Admin/Manager)
 */
export const createCategory = async (data: CreateCategoryDTO): Promise<TicketCategory> => {
  const response = await api.post('/ticket-categories', data);
  return response.data.data;
};

/**
 * Mettre à jour une catégorie (Admin/Manager)
 */
export const updateCategory = async (
  id: string,
  data: UpdateCategoryDTO
): Promise<TicketCategory> => {
  const response = await api.put(`/ticket-categories/${id}`, data);
  return response.data.data;
};

/**
 * Supprimer une catégorie (Admin/Manager)
 */
export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/ticket-categories/${id}`);
};

/**
 * Formater une catégorie pour l'affichage
 */
export const formatCategoryDisplay = (category: TicketCategory): string => {
  return category.icon ? `${category.icon} ${category.name}` : category.name;
};

/**
 * Obtenir la couleur d'une catégorie (avec fallback)
 */
export const getCategoryColor = (category: TicketCategory | null): string => {
  if (!category) return '#9CA3AF'; // Gris par défaut
  return category.color || '#3B82F6'; // Bleu par défaut
};
