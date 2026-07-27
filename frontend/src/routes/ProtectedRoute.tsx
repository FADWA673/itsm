import { Navigate, Outlet } from "react-router-dom";
import { PATHS } from "./paths";
import { useAuthStore } from "../store";

interface ProtectedRouteProps {
  /** Rôle requis pour accéder à la route (optionnel) */
  requiredRole?: string;
}

/**
 * Composant de protection des routes.
 * Redirige vers /login si l'utilisateur n'est pas authentifié.
 * Redirige vers /dashboard si le rôle requis ne correspond pas.
 *
 * Usage :
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute requiredRole="admin" />}>
 *     <Route path="/admin" element={<AdminPage />} />
 *   </Route>
 */
const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, hasRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={PATHS.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
