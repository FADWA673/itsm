/**
 * Format standard de toutes les réponses de l'API backend.
 * Correspond exactement à ApiResponse<T> du backend (ITSM-002).
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
 * Paramètres de pagination pour les requêtes GET de listes.
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Erreur API standardisée côté frontend.
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
