/**
 * Format standard de toutes les réponses API.
 * Tous les endpoints renvoient cette structure.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

/**
 * Métadonnées de pagination pour les listes.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paramètres de pagination extraits de la query string.
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}
