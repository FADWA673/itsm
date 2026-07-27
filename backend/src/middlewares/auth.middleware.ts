import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { logAudit, auditAccessDenied } from "../utils/audit";

// =============================================================================
// Middleware d'authentification
// =============================================================================

/**
 * Vérifie que la requête contient un Bearer token valide.
 * Si valide : attache le payload à `req.user` et passe au middleware suivant.
 * Si invalide : renvoie 401.
 *
 * Usage :
 *   router.get("/protected", authenticate, handler)
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logAudit({
        action: "AUTH_TOKEN_INVALID",
        ip: req.ip,
        details: { reason: "Missing or malformed Authorization header" },
        success: false,
      });
      throw new ApiError(401, "Authentication required");
    }

    const token = authHeader.substring(7);

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
    };

    next();
  }
);

// =============================================================================
// Middleware d'autorisation RBAC
// =============================================================================

/**
 * Vérifie que l'utilisateur authentifié a l'un des rôles requis.
 * Doit être utilisé APRÈS `authenticate`.
 *
 * Usage :
 *   router.delete("/users/:id", authenticate, authorize("admin", "super_admin"), handler)
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const userRole = req.user.role.toLowerCase();
    const hasRole = allowedRoles.map((r) => r.toLowerCase()).includes(userRole);

    if (!hasRole) {
      auditAccessDenied(
        req.user.id,
        req.originalUrl,
        allowedRoles.join(", "),
        req.ip
      );
      throw new ApiError(
        403,
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
}
