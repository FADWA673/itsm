import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PATHS } from "./paths";
import ProtectedRoute from "./ProtectedRoute";
import PageLoader from "../components/ui/PageLoader";
import AuthLayout from "../layouts/AuthLayout";

// ─── Lazy loading ──────────────────────────────────────────────────────────────

// Pages publiques
const HomePage = lazy(() => import("../pages/HomePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Pages auth
const LoginPage = lazy(() => import("../pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage"));

// Dashboards par rôle (chacun son propre layout intégré)
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const ManageUsersPage = lazy(() => import("../pages/admin/ManageUsersPage"));
const RolesPermissionsPage = lazy(() => import("../pages/admin/RolesPermissionsPage"));
const TicketCategoriesPage = lazy(() => import("../pages/admin/TicketCategoriesPage"));
const SLAPage = lazy(() => import("../pages/admin/SLAPage"));
const AuditLogsPage = lazy(() => import("../pages/admin/AuditLogsPage"));
const SystemSettingsPage = lazy(() => import("../pages/admin/SystemSettingsPage"));
const ManagerDashboardPage = lazy(() => import("../pages/manager/ManagerDashboardPage"));
const DeptManagerDashboardPage = lazy(() => import("../pages/dept-manager/DeptManagerDashboardPage"));
const TechnicianDashboardPage = lazy(() => import("../pages/technician/TechnicianDashboardPage"));
const EmployeeDashboardPage = lazy(() => import("../pages/employee/EmployeeDashboardPage"));

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public ───────────────────────────────────────────────── */}
        <Route path={PATHS.HOME} element={<HomePage />} />

        {/* ── Auth ─────────────────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path={PATHS.LOGIN} element={<LoginPage />} />
          <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={PATHS.RESET_PASSWORD} element={<ResetPasswordPage />} />
        </Route>

        {/* ── Admin Dashboard ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="SUPER_ADMIN" />}>
          <Route path={PATHS.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path="/admin/roles" element={<RolesPermissionsPage />} />
          <Route path="/admin/categories" element={<TicketCategoriesPage />} />
          <Route path="/admin/sla" element={<SLAPage />} />
          <Route path="/admin/audit" element={<AuditLogsPage />} />
          <Route path="/admin/settings" element={<SystemSettingsPage />} />
        </Route>

        {/* ── Manager Dashboard ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="MANAGER" />}>
          <Route path={PATHS.MANAGER_DASHBOARD} element={<ManagerDashboardPage />} />
        </Route>

        {/* ── Dept Manager Dashboard ────────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="DEPT_MANAGER" />}>
          <Route path={PATHS.DEPT_MANAGER_DASHBOARD} element={<DeptManagerDashboardPage />} />
        </Route>

        {/* ── Technician Dashboard ──────────────────────────────────── */}
        <Route element={<ProtectedRoute requiredRole="TECHNICIAN" />}>
          <Route path={PATHS.TECHNICIAN_DASHBOARD} element={<TechnicianDashboardPage />} />
        </Route>

        {/* ── Employee Dashboard ────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.EMPLOYEE_DASHBOARD} element={<EmployeeDashboardPage />} />
          <Route path={PATHS.DASHBOARD} element={<EmployeeDashboardPage />} />
        </Route>

        {/* ── 404 ──────────────────────────────────────────────────── */}
        <Route path={PATHS.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
