/**
 * Classe d'erreur custom pour l'API.
 * Utilisée pour renvoyer des erreurs HTTP structurées avec un statusCode.
 *
 * Exemple :
 *   throw new ApiError(404, "Ticket not found");
 *   throw new ApiError(400, "Invalid input");
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Nécessaire pour que instanceof fonctionne correctement avec TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
