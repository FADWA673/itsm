import { Navigate, Outlet } from "react-router-dom";
import { PATHS } from "./paths";

interface ProtectedRouteProps {
  /** Rôle requis pour accéder à la route (optionnel) */
  requiredRole?: string;
}

/**
 * Composant de protection des routes.
 * Redirige vers /login si l'utilisateur n'est pas authentifié.
 *
 * NOTE : Pour l'instant, isAuthenticated est hardcodé à false —
 * il sera connecté au store d'auth dans ITSM-004 (Authentication).
 *
 * Usage :
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 */
const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  // TODO (ITSM-004) : remplacer par useAuthStore()
  const isAuthenticated = false;
  const userRole = "";

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
