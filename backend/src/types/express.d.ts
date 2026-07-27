/**
 * Extension du type Request d'Express.
 * Permet d'attacher l'utilisateur authentifié à chaque requête
 * après le middleware `authenticate`.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        organizationId: string;
      };
    }
  }
}

export {};
