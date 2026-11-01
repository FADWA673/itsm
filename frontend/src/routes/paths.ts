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
  DEPT_MANAGER_DASHBOARD: "/dept-manager/dashboard",
  TECHNICIAN_DASHBOARD: "/technician/dashboard",
  EMPLOYEE_DASHBOARD: "/employee/dashboard",

  // Tickets
  TICKETS: "/tickets",
  TICKET_NEW: "/tickets/new",
  TICKET_DETAIL: "/tickets/:id",

  // Assets
  ASSETS: "/assets",
  ASSET_DETAIL: "/assets/:id",

  // Employee pages
  EMPLOYEE_NOTIFICATIONS: "/employee/notifications",
  EMPLOYEE_PROFILE: "/employee/profile",
  EMPLOYEE_TICKETS: "/employee/tickets",
  EMPLOYEE_TICKET_DETAIL: "/employee/tickets/:id",
  EMPLOYEE_CREATE_TICKET: "/employee/create-ticket",
  EMPLOYEE_KNOWLEDGE_BASE: "/employee/kb",
  EMPLOYEE_KB_ARTICLE: "/employee/kb/:slug",

  // Admin pages
  ADMIN_TICKETS: "/admin/tickets",
  ADMIN_TICKET_DETAIL: "/admin/tickets/:id",
  ADMIN_KB_PENDING: "/admin/kb/pending",
  ADMIN_KB_ARTICLES: "/admin/kb/articles",
  ADMIN_KB_CATEGORIES: "/admin/kb/categories",
  ADMIN_WHATSAPP: "/admin/whatsapp",

  // Technician pages
  TECHNICIAN_TICKETS: "/technician/tickets",
  TECHNICIAN_TICKET_DETAIL: "/technician/tickets/:id",
  TECHNICIAN_ALL_TICKETS: "/technician/all-tickets",
  TECHNICIAN_QUEUE: "/technician/queue",
  TECHNICIAN_SETTINGS: "/technician/settings",
  TECHNICIAN_ASSETS: "/technician/assets",
  TECHNICIAN_KB: "/technician/kb",
  TECHNICIAN_KB_CREATE: "/technician/kb/create",
  TECHNICIAN_KB_EDIT: "/technician/kb/edit/:id",

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
