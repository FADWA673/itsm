import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PATHS } from "./paths";
import ProtectedRoute from "./ProtectedRoute";
import PageLoader from "../components/ui/PageLoader";
import AuthLayout from "../layouts/AuthLayout";
import { AdvancedAIChatWidget } from "../components/AIAssistant/AdvancedAIChatWidget";

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
const TicketCategoriesPage = lazy(() => import("../pages/admin/KBCategoriesPage"));
const SLAPage = lazy(() => import("../pages/admin/SLAPage"));
const SystemSettingsPage = lazy(() => import("../pages/admin/SystemSettingsPage"));
const AdminTicketsPage = lazy(() => import("../pages/admin/AdminTicketsPage"));
const AdminTicketDetailPage = lazy(() => import("../pages/admin/AdminTicketDetailPage"));
const ManageKBArticlesPage = lazy(() => import("../pages/admin/ManageKBArticlesPage"));
const WhatsAppSettingsPage = lazy(() => import("../pages/admin/WhatsAppSettingsPage"));
const TestAIPage = lazy(() => import("../pages/admin/TestAIPage"));
const AnalyticsPage = lazy(() => import("../pages/admin/AnalyticsPage"));
const ManagerDashboardPage = lazy(() => import("../pages/manager/ManagerDashboardPage"));
const DeptManagerDashboardPage = lazy(() => import("../pages/dept-manager/DeptManagerDashboardPage"));
const TechnicianDashboardPage = lazy(() => import("../pages/technician/TechnicianDashboardPage"));
const TechnicianTicketsList = lazy(() =>
  import("../pages/technician/TechnicianTicketsPage").then((m) => ({ default: m.TechnicianTicketsList }))
);
const TechnicianTicketDetail = lazy(() =>
  import("../pages/technician/TechnicianTicketsPage").then((m) => ({ default: m.TechnicianTicketDetail }))
);
const AllTicketsPage = lazy(() => import("../pages/technician/AllTicketsPage"));
const QueuePage = lazy(() => import("../pages/technician/QueuePage"));
const SettingsPage = lazy(() => import("../pages/technician/SettingsPage"));
const AssetsPage = lazy(() => import("../pages/technician/AssetsPage"));
const MyKBArticlesPage = lazy(() => import("../pages/technician/MyKBArticlesPage"));
const CreateKBArticlePage = lazy(() => import("../pages/technician/CreateKBArticlePage"));
const ReportsPage = lazy(() => import("../pages/technician/ReportsPage"));
const EmployeeDashboardPage = lazy(() => import("../pages/employee/EmployeeDashboardPage"));
const MyTicketsPage = lazy(() => import("../pages/employee/MyTicketsPage"));
const CreateTicketPage = lazy(() => import("../pages/employee/CreateTicketPage"));
const NotificationsPage = lazy(() => import("../pages/employee/NotificationsPage"));
const ProfilePage = lazy(() => import("../pages/employee/ProfilePage"));
const TicketDetailPage = lazy(() => import("../pages/employee/TicketDetailPage"));
const KnowledgeBasePage = lazy(() => import("../pages/employee/KnowledgeBasePage"));
const KBArticleDetailPage = lazy(() => import("../pages/employee/KBArticleDetailPage"));

function AppRouter() {
  return (
    <>
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
          <Route path={PATHS.ADMIN_TICKETS} element={<AdminTicketsPage />} />
          <Route path={PATHS.ADMIN_TICKET_DETAIL} element={<AdminTicketDetailPage />} />
          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path={PATHS.ADMIN_WHATSAPP} element={<WhatsAppSettingsPage />} />
          <Route path={PATHS.ADMIN_KB_ARTICLES} element={<ManageKBArticlesPage />} />
          <Route path="/admin/categories" element={<TicketCategoriesPage />} />
          <Route path="/admin/roles" element={<RolesPermissionsPage />} />
          <Route path="/admin/sla" element={<SLAPage />} />
          <Route path="/admin/settings" element={<SystemSettingsPage />} />
          <Route path="/admin/test-ai" element={<TestAIPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
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
          <Route path={PATHS.TECHNICIAN_TICKETS} element={<TechnicianTicketsList />} />
          <Route path={PATHS.TECHNICIAN_TICKET_DETAIL} element={<TechnicianTicketDetail />} />
          <Route path={PATHS.TECHNICIAN_ALL_TICKETS} element={<AllTicketsPage />} />
          <Route path={PATHS.TECHNICIAN_QUEUE} element={<QueuePage />} />
          <Route path={PATHS.TECHNICIAN_SETTINGS} element={<SettingsPage />} />
          <Route path={PATHS.TECHNICIAN_ASSETS} element={<AssetsPage />} />
          <Route path={PATHS.TECHNICIAN_KB} element={<MyKBArticlesPage />} />
          <Route path={PATHS.TECHNICIAN_KB_CREATE} element={<CreateKBArticlePage />} />
          <Route path={PATHS.TECHNICIAN_KB_EDIT} element={<CreateKBArticlePage />} />
          <Route path="/technician/reports" element={<ReportsPage />} />
        </Route>

        {/* ── Employee Dashboard ────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path={PATHS.EMPLOYEE_DASHBOARD} element={<EmployeeDashboardPage />} />
          <Route path={PATHS.DASHBOARD} element={<EmployeeDashboardPage />} />
          <Route path={PATHS.EMPLOYEE_TICKETS} element={<MyTicketsPage />} />
          <Route path={PATHS.EMPLOYEE_TICKET_DETAIL} element={<TicketDetailPage />} />
          <Route path={PATHS.EMPLOYEE_CREATE_TICKET} element={<CreateTicketPage />} />
          <Route path={PATHS.EMPLOYEE_NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={PATHS.EMPLOYEE_PROFILE} element={<ProfilePage />} />
          <Route path={PATHS.EMPLOYEE_KNOWLEDGE_BASE} element={<KnowledgeBasePage />} />
          <Route path={PATHS.EMPLOYEE_KB_ARTICLE} element={<KBArticleDetailPage />} />
        </Route>

        {/* ── 404 ──────────────────────────────────────────────────── */}
        <Route path={PATHS.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>

    {/* Advanced AI Chat Widget - visible on all pages */}
    <AdvancedAIChatWidget />
  </>
  );
}

export default AppRouter;
