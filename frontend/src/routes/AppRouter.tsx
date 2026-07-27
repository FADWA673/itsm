import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PATHS } from "./paths";
import ProtectedRoute from "./ProtectedRoute";

// ─── Lazy loading des pages ────────────────────────────────────────────────────
// Chaque page est chargée uniquement quand elle est visitée (performance)

// Pages publiques
const HomePage = lazy(() => import("../pages/HomePage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Pages protégées
const DashboardPage = lazy(() => import("../pages/DashboardPage"));

// ─── Fallback de chargement ───────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "16px",
        color: "#6b6375",
      }}
    >
      Chargement...
    </div>
  );
}

/**
 * Configuration centralisée de toutes les routes de l'application.
 *
 * Structure :
 * - Routes publiques : accessibles sans authentification
 * - Routes protégées : enveloppées dans <ProtectedRoute>
 *   → redirigent vers /login si non authentifié
 *
 * Futurs modules à ajouter ici (ITSM-004+) :
 *   const TicketsPage = lazy(() => import("../pages/TicketsPage"))
 *   <Route path={PATHS.TICKETS} element={<TicketsPage />} />
 */
function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Routes publiques ─────────────────────────────────────────────── */}
        <Route path={PATHS.HOME} element={<HomePage />} />
        <Route path={PATHS.LOGIN} element={<LoginPage />} />

        {/* ── Routes protégées ─────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.DASHBOARD} element={<DashboardPage />} />
        </Route>

        {/* ── 404 ──────────────────────────────────────────────────────────── */}
        <Route path={PATHS.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
