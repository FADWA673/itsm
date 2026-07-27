/**
 * Extension du type Request d'Express.
 * Permet d'attacher l'utilisateur authentifié à chaque requête après le middleware auth.
 * Le type JwtPayload sera défini dans le module auth (ITSM-003).
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
