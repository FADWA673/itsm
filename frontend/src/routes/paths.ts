/**
 * Constantes de tous les chemins de l'application.
 * Utiliser PATHS.XXX partout — jamais de strings en dur dans le code.
 */
export const PATHS = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Dashboards par rôle
  DASHBOARD: "/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
  MANAGER_DASHBOARD: "/manager/dashboard",
  TECHNICIAN_DASHBOARD: "/technician/dashboard",
  EMPLOYEE_DASHBOARD: "/employee/dashboard",

  // Tickets
  TICKETS: "/tickets",
  TICKET_NEW: "/tickets/new",
  TICKET_DETAIL: "/tickets/:id",

  // Assets
  ASSETS: "/assets",
  ASSET_DETAIL: "/assets/:id",

  // Administration
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_ORGANIZATIONS: "/admin/organizations",

  // Utilitaires
  NOT_FOUND: "*",
} as const;

/**
 * Génère un chemin avec paramètres dynamiques.
 * Exemple : buildPath(PATHS.TICKET_DETAIL, { id: "123" }) → "/tickets/123"
 */
export function buildPath(
  path: string,
  params: Record<string, string>
): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, value),
    path
  );
}
