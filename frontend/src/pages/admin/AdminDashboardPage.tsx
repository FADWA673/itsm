import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import GroupIcon from "@mui/icons-material/Group";
import { useAuthStore } from "../../store";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";

const STATS = [
  { label: "Total Tickets", value: "—", icon: <ConfirmationNumberIcon />, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Open Tickets", value: "—", icon: <HourglassEmptyIcon />, color: "#F59E0B", bg: "#FFFBEB" },
  { label: "Resolved Today", value: "—", icon: <CheckCircleIcon />, color: "#10B981", bg: "#ECFDF5" },
  { label: "Total Users", value: "—", icon: <GroupIcon />, color: "#8B5CF6", bg: "#F5F3FF" },
];

const ACTIONS = [
  { label: "Manage Users", desc: "Create, edit, deactivate accounts", icon: <PeopleIcon />, color: "#2563EB", path: "/admin/users" },
  { label: "Roles & Permissions", desc: "Configure access levels", icon: <SecurityIcon />, color: "#7C3AED", path: "/admin/roles" },
  { label: "Ticket Categories", desc: "Manage ticket types", icon: <CategoryIcon />, color: "#059669", path: "/admin/categories" },
  { label: "SLA & Notifications", desc: "Configure response time policies", icon: <TrendingUpIcon />, color: "#D97706", path: "/admin/sla" },
  { label: "Audit Logs", desc: "View system activity history", icon: <HistoryIcon />, color: "#DC2626", path: "/admin/audit" },
  { label: "System Settings", desc: "Platform configuration", icon: <SettingsIcon />, color: "#0369A1", path: "/admin/settings" },
];

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <AdminLayout title="Administrator Dashboard">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>
          Welcome back, {user?.firstName} 👋
        </Typography>
        <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
          Here's what's happening in your ITSM platform today.
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
        {STATS.map((stat) => (
          <Paper key={stat.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, flexShrink: 0 }}>{stat.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: ADMIN_COLORS.textPrimary, lineHeight: 1 }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>{stat.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Quick Actions */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, mb: 2 }}>Quick Actions</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        {ACTIONS.map((action) => (
          <Paper key={action.label} elevation={0} onClick={() => navigate(action.path)} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: action.color, transform: "translateY(-2px)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${action.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: action.color, mb: 1.5 }}>{action.icon}</Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 0.5 }}>{action.label}</Typography>
            <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary }}>{action.desc}</Typography>
          </Paper>
        ))}
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
