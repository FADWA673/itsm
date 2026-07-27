import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PATHS } from "./paths";
import ProtectedRoute from "./ProtectedRoute";
import PageLoader from "../components/ui/PageLoader";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";

// ─── Lazy loading des pages ────────────────────────────────────────────────────

// Pages publiques
const HomePage = lazy(() => import("../pages/HomePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Pages auth (dans AuthLayout)
const LoginPage = lazy(() => import("../pages/LoginPage"));

// Pages protégées (dans MainLayout)
const DashboardPage = lazy(() => import("../pages/DashboardPage"));

/**
 * Configuration centralisée de toutes les routes de l'application.
 *
 * Structure :
 * - / → HomePage (publique, sans layout)
 * - /login → AuthLayout → LoginPage
 * - /dashboard, /tickets, ... → ProtectedRoute → MainLayout → Page
 * - * → NotFoundPage
 *
 * Pour ajouter un futur module (ITSM-004+) :
 *   const TicketsPage = lazy(() => import("../pages/TicketsPage"))
 *   <Route path={PATHS.TICKETS} element={<TicketsPage />} />
 *   (à l'intérieur du bloc ProtectedRoute → MainLayout)
 */
function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Page d'accueil publique ───────────────────────────────────────── */}
        <Route path={PATHS.HOME} element={<HomePage />} />

        {/* ── Pages auth — AuthLayout ───────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path={PATHS.LOGIN} element={<LoginPage />} />
        </Route>

        {/* ── Pages protégées — MainLayout ─────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={PATHS.DASHBOARD} element={<DashboardPage />} />
            {/* Futurs modules ajoutés ici */}
          </Route>
        </Route>

        {/* ── 404 ──────────────────────────────────────────────────────────── */}
        <Route path={PATHS.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
