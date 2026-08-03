import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import CategoryIcon from "@mui/icons-material/Category";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import GroupIcon from "@mui/icons-material/Group";

import { useAuthStore } from "../../store";
import { PATHS } from "../../routes/paths";

// ─── Palette ─────────────────────────────────────────────────────────────────
const COLORS = {
  sidebarBg: "#0F172A",
  sidebarActive: "#2563EB",
  sidebarHover: "rgba(37,99,235,0.15)",
  sidebarText: "#D1D5DB",
  sidebarTextActive: "#FFFFFF",
  headerBg: "#FFFFFF",
  pageBg: "#F1F5F9",
  cardBg: "#FFFFFF",
  primary: "#2563EB",
  textPrimary: "#0F172A",
  textSecondary: "#6B7280",
  border: "#D1D5DB",
};

const SIDEBAR_WIDTH = 260;

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, path: PATHS.ADMIN_DASHBOARD },
  { label: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
  { label: "Roles & Permissions", icon: <SecurityIcon />, path: "/admin/roles" },
  { label: "Ticket Categories", icon: <CategoryIcon />, path: "/admin/categories" },
  { label: "SLA & Notifications", icon: <NotificationsIcon />, path: "/admin/sla" },
  { label: "Audit Logs", icon: <HistoryIcon />, path: "/admin/audit" },
  { label: "System Settings", icon: <SettingsIcon />, path: "/admin/settings" },
];

// ─── Stat cards data ──────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Tickets", value: "—", icon: <ConfirmationNumberIcon />, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Open Tickets", value: "—", icon: <HourglassEmptyIcon />, color: "#F59E0B", bg: "#FFFBEB" },
  { label: "Resolved Today", value: "—", icon: <CheckCircleIcon />, color: "#10B981", bg: "#ECFDF5" },
  { label: "Total Users", value: "—", icon: <GroupIcon />, color: "#8B5CF6", bg: "#F5F3FF" },
];

// ─── Component ────────────────────────────────────────────────────────────────
function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN);
  };

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "AD";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: COLORS.pageBg }}>

      {/* ══ SIDEBAR ═══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          width: sidebarOpen ? SIDEBAR_WIDTH : 72,
          flexShrink: 0,
          bgcolor: COLORS.sidebarBg,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease",
          overflow: "hidden",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 2.5,
            borderBottom: `1px solid rgba(255,255,255,0.08)`,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: COLORS.sidebarActive,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ color: "white", fontWeight: 800, fontSize: 16 }}>
              IT
            </Typography>
          </Box>
          {sidebarOpen && (
            <Typography sx={{ color: "white", fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>
              ITSM Admin
            </Typography>
          )}
        </Box>

        {/* Navigation */}
        <List sx={{ flex: 1, px: 1, py: 1.5 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip
                key={item.path}
                title={sidebarOpen ? "" : item.label}
                placement="right"
              >
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1.5,
                    py: 1,
                    bgcolor: isActive ? COLORS.sidebarActive : "transparent",
                    "&:hover": { bgcolor: isActive ? COLORS.sidebarActive : COLORS.sidebarHover },
                    transition: "all 0.15s",
                    minHeight: 44,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "white" : COLORS.sidebarText,
                      minWidth: 36,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          style: {
                            fontSize: 14,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "white" : COLORS.sidebarText,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />

        {/* User + Logout */}
        <Box sx={{ px: 1.5, py: 2 }}>
          {sidebarOpen && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, px: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.sidebarActive, fontSize: 13 }}>
                {initials}
              </Avatar>
              <Box sx={{ overflow: "hidden" }}>
                <Typography noWrap sx={{ color: "white", fontSize: 13, fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography sx={{ color: COLORS.sidebarText, fontSize: 11 }}>
                  {user?.role?.replace("_", " ")}
                </Typography>
              </Box>
            </Box>
          )}
          <Tooltip title="Logout" placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                px: 1.5,
                py: 1,
                "&:hover": { bgcolor: "rgba(239,68,68,0.15)" },
              }}
            >
              <ListItemIcon sx={{ color: "#EF4444", minWidth: 36 }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText
                  primary="Logout"
                  slotProps={{
                    primary: {
                      style: { fontSize: 14, color: "#EF4444" },
                    },
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
      <Box
        sx={{
          flex: 1,
          ml: sidebarOpen ? `${SIDEBAR_WIDTH}px` : "72px",
          transition: "margin-left 0.25s ease",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: COLORS.headerBg,
            borderBottom: `1px solid ${COLORS.border}`,
            px: 3,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: 18 }}>
              Administrator Dashboard
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ color: COLORS.textSecondary }} />
              </Badge>
            </IconButton>
            <Avatar sx={{ width: 34, height: 34, bgcolor: COLORS.primary, fontSize: 13, cursor: "pointer" }}>
              {initials}
            </Avatar>
          </Box>
        </Box>

        {/* ── Page Content ──────────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>

          {/* Welcome */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
              Welcome back, {user?.firstName} 👋
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary, mt: 0.5 }}>
              Here's what's happening in your ITSM platform today.
            </Typography>
          </Box>

          {/* ── Stats Cards ──────────────────────────────────────────────────── */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
              gap: 2,
              mb: 3,
            }}
          >
            {STATS.map((stat) => (
              <Paper
                key={stat.label}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  bgcolor: COLORS.cardBg,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: stat.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stat.color,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: COLORS.textSecondary, mt: 0.5 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          {/* ── Quick Actions ────────────────────────────────────────────────── */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 2 }}>
            Quick Actions
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 2,
              mb: 3,
            }}
          >
            {[
              { label: "Manage Users", desc: "Create, edit, deactivate accounts", icon: <PeopleIcon />, color: "#2563EB", path: "/admin/users" },
              { label: "Roles & Permissions", desc: "Configure access levels", icon: <SecurityIcon />, color: "#7C3AED", path: "/admin/roles" },
              { label: "Ticket Categories", desc: "Manage ticket types", icon: <CategoryIcon />, color: "#059669", path: "/admin/categories" },
              { label: "SLA & Notifications", desc: "Configure policies", icon: <TrendingUpIcon />, color: "#D97706", path: "/admin/sla" },
              { label: "Audit Logs", desc: "View system activity", icon: <HistoryIcon />, color: "#DC2626", path: "/admin/audit" },
              { label: "System Settings", desc: "Platform configuration", icon: <SettingsIcon />, color: "#0369A1", path: "/admin/settings" },
            ].map((action) => (
              <Paper
                key={action.label}
                elevation={0}
                onClick={() => navigate(action.path)}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${COLORS.border}`,
                  bgcolor: COLORS.cardBg,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: action.color,
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 16px rgba(0,0,0,0.08)`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: `${action.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: action.color,
                    mb: 1.5,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, mb: 0.5 }}>
                  {action.label}
                </Typography>
                <Typography sx={{ fontSize: 12, color: COLORS.textSecondary }}>
                  {action.desc}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboardPage;
