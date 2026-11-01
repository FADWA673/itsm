import { useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

import { useAuthStore, useThemeStore, useInAppNotificationStore } from "../store";
import { PATHS } from "../routes/paths";
import { getAdminColors, SIDEBAR_WIDTH } from "../styles/adminTheme";
import { ADMIN_NAV_ITEMS } from "../routes/adminNavItems";
import { LanguageSelector } from "../components/LanguageSelector";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

function AdminLayout({ children, title }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const C = getAdminColors(mode);
  const handleLogout = () => { logout(); navigate(PATHS.LOGIN); };
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "AD";
  const { unreadCount, load, initialized } = useInAppNotificationStore();
  const badgeCount = unreadCount;

  useEffect(() => {
    if (!initialized) load();
  }, [initialized, load]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: C.pageBg }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <Box sx={{
        width: sidebarOpen ? SIDEBAR_WIDTH : 72,
        flexShrink: 0,
        bgcolor: C.sidebarBg,
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        transition: "width 0.25s ease", overflow: "hidden",
        position: "fixed", height: "100vh", zIndex: 100,
      }}>

        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 2.5, borderBottom: `1px solid ${C.border}` }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: C.sidebarActive, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Typography sx={{ color: "white", fontWeight: 800, fontSize: 14 }}>IT</Typography>
          </Box>
          {sidebarOpen && (
            <Typography sx={{ color: C.textPrimary, fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>
              ITSM Admin
            </Typography>
          )}
        </Box>

        {/* Navigation */}
        <List sx={{ flex: 1, px: 1, py: 1.5, overflowY: "auto", overflowX: "hidden" }}>
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.path} title={sidebarOpen ? "" : item.label} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2, mb: 0.5, px: 1.5, py: 1, minHeight: 44,
                    bgcolor: isActive ? C.sidebarActive : "transparent",
                    "&:hover": { bgcolor: isActive ? C.sidebarActive : C.sidebarHover },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? "white" : C.sidebarText, minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText
                      primary={item.label}
                      slotProps={{ primary: { style: { fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "white" : C.sidebarText, whiteSpace: "nowrap" } } }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ bgcolor: C.border }} />

        {/* User info + Logout */}
        <Box sx={{ px: 1.5, py: 2 }}>
          {sidebarOpen && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, px: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: C.sidebarActive, fontSize: 13 }}>{initials}</Avatar>
              <Box sx={{ overflow: "hidden" }}>
                <Typography noWrap sx={{ color: C.textPrimary, fontSize: 13, fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography sx={{ color: C.textSecondary, fontSize: 11 }}>
                  {user?.role?.replace("_", " ")}
                </Typography>
              </Box>
            </Box>
          )}
          <Tooltip title="Logout" placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{ borderRadius: 2, px: 1.5, py: 1, "&:hover": { bgcolor: "rgba(239,68,68,0.12)" } }}
            >
              <ListItemIcon sx={{ color: "#EF4444", minWidth: 36 }}><LogoutIcon fontSize="small" /></ListItemIcon>
              {sidebarOpen && (
                <ListItemText primary="Logout" slotProps={{ primary: { style: { fontSize: 14, color: "#EF4444" } } }} />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
      <Box sx={{ flex: 1, ml: sidebarOpen ? `${SIDEBAR_WIDTH}px` : "72px", transition: "margin-left 0.25s ease", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <Box sx={{
          bgcolor: C.headerBg,
          borderBottom: `1px solid ${C.border}`,
          px: 3, py: 1.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 99,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small" sx={{ color: C.textSecondary }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: C.textPrimary, fontSize: 18 }}>{title}</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* ☀️/🌙 Toggle dark/light mode */}
            <Tooltip title={mode === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}>
              <IconButton onClick={toggleMode} size="small" sx={{ color: C.textSecondary }}>
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* Language Selector */}
            <Box sx={{ borderLeft: `1px solid ${C.border}`, pl: 1, ml: 0.5 }}>
              <LanguageSelector />
            </Box>

            <Tooltip title="Notifications">
              <IconButton
                size="small"
                sx={{ color: C.textSecondary }}
                onClick={() => navigate(PATHS.EMPLOYEE_NOTIFICATIONS)}
              >
                <Badge badgeContent={badgeCount || undefined} color="error" max={99}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="My profile">
              <Avatar
                onClick={() => navigate(PATHS.EMPLOYEE_PROFILE)}
                sx={{ width: 34, height: 34, bgcolor: C.primary, fontSize: 13, cursor: "pointer" }}
              >
                {initials}
              </Avatar>
            </Tooltip>
          </Box>
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default AdminLayout;
