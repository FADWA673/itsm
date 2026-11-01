/**
 * Rôles disponibles dans la plateforme ITSM.
 * Le backend renvoie les rôles en MAJUSCULES (Prisma enum).
 */
export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "DEPT_MANAGER"
  | "TECHNICIAN"
  | "USER"
  // legacy lowercase (kept for compatibility)
  | "super_admin"
  | "admin"
  | "manager"
  | "technician"
  | "user";

/**
 * Permissions granulaires par ressource.
 * Sera complété dans ITSM-004.
 */
export type Permission =
  | "tickets:read"
  | "tickets:write"
  | "tickets:delete"
  | "users:read"
  | "users:write"
  | "assets:read"
  | "assets:write"
  | "admin:access";

/**
 * Informations de l'utilisateur connecté.
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  avatarUrl?: string;
  permissions: Permission[];
}

/**
 * Payload du JWT retourné par le backend.
 */
export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: UserRole;
  organizationId: string;
  iat: number;
  exp: number;
}

/**
 * Réponse de l'endpoint de login.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
