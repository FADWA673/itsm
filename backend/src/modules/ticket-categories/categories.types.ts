/**
 * Types et interfaces pour le module Categories
 * Gestion des catégories de tickets (Hardware, Software, Network, etc.)
 */

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

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  active: boolean;
  displayOrder: number;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: CategoryResponse | null;
  subcategories?: CategoryResponse[];
  _count?: {
    tickets: number;
    subcategories: number;
  };
}
