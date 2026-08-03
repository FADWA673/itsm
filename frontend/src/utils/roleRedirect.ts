import { PATHS } from "../routes/paths";

/**
 * Retourne le chemin du dashboard selon le rôle de l'utilisateur.
 * Appelé après un login réussi pour rediriger vers le bon dashboard.
 */
export function getDashboardByRole(role: string): string {
  switch (role.toUpperCase()) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return PATHS.ADMIN_DASHBOARD;
    case "MANAGER":
      return PATHS.MANAGER_DASHBOARD;
    case "TECHNICIAN":
      return PATHS.TECHNICIAN_DASHBOARD;
    case "USER":
    default:
      return PATHS.EMPLOYEE_DASHBOARD;
  }
}
