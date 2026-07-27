/**
 * Export central de tous les services API.
 * Importer depuis ici plutôt que depuis les fichiers individuels.
 *
 * Usage :
 *   import { checkHealth } from "../services"
 *
 * Futurs services à ajouter ici (ITSM-004+) :
 *   export * from "./auth.service"
 *   export * from "./ticket.service"
 *   export * from "./user.service"
 */
export * from "./health.service";
export { apiClient, get, post, put, patch, del } from "./api";
