import { useState, type ReactNode } from "react";
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
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";

import { useAuthStore, useThemeStore } from "../store";
import { PATHS } from "../routes/paths";
import { getAdminColors, SIDEBAR_WIDTH } from "../styles/adminTheme";

const NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, path: PATHS.TECHNICIAN_DASHBOARD },
  { label: "My Tickets", icon: <ConfirmationNumberIcon />, path: "/technician/tickets" },
  { label: "Assigned to Me", icon: <AssignmentIcon />, path: "/technician/assigned" },
  { label: "Resolved", icon: <CheckCircleIcon />, path: "/technician/resolved" },
  { label: "My Profile", icon: <PersonIcon />, path: "/technician/profile" },
];

interface TechnicianLayoutProps {
  children: ReactNode;
  title: string;
}

function TechnicianLayout({ children, title }: TechnicianLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const C = getAdminColors(mode);

  const handleLogout = () => { logout(); navigate(PATHS.LOGIN); };
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "TC";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: C.pageBg }}>
      {/* SIDEBAR */}
      <Box sx={{ width: sidebarOpen ? SIDEBAR_WIDTH : 72, flexShrink: 0, bgcolor: C.sidebarBg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width 0.25s ease", overflow: "hidden", position: "fixed", height: "100vh", zIndex: 100 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 2.5, borderBottom: `1px solid ${C.border}` }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Typography sx={{ color: "white", fontWeight: 800, fontSize: 14 }}>TC</Typography>
          </Box>
          {sidebarOpen && <Typography sx={{ color: C.textPrimary, fontWeight: 700, fontSize: 16, whiteSpace: "nowrap" }}>ITSM Technician</Typography>}
        </Box>

        <List sx={{ flex: 1, px: 1, py: 1.5 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip key={item.path} title={sidebarOpen ? "" : item.label} placement="right">
                <ListItemButton onClick={() => navigate(item.path)} sx={{ borderRadius: 2, mb: 0.5, px: 1.5, py: 1, minHeight: 44, bgcolor: isActive ? "#D97706" : "transparent", "&:hover": { bgcolor: isActive ? "#D97706" : C.sidebarHover } }}>
                  <ListItemIcon sx={{ color: isActive ? "white" : C.sidebarText, minWidth: 36 }}>{item.icon}</ListItemIcon>
                  {sidebarOpen && <ListItemText primary={item.label} slotProps={{ primary: { style: { fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? "white" : C.sidebarText, whiteSpace: "nowrap" } } }} />}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        <Divider sx={{ bgcolor: C.border }} />
        <Box sx={{ px: 1.5, py: 2 }}>
          {sidebarOpen && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5, px: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#D97706", fontSize: 13 }}>{initials}</Avatar>
              <Box sx={{ overflow: "hidden" }}>
                <Typography noWrap sx={{ color: C.textPrimary, fontSize: 13, fontWeight: 600 }}>{user?.firstName} {user?.lastName}</Typography>
                <Typography sx={{ color: C.textSecondary, fontSize: 11 }}>Technician</Typography>
              </Box>
            </Box>
          )}
          <Tooltip title="Logout" placement="right">
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, px: 1.5, py: 1, "&:hover": { bgcolor: "rgba(239,68,68,0.12)" } }}>
              <ListItemIcon sx={{ color: "#EF4444", minWidth: 36 }}><LogoutIcon fontSize="small" /></ListItemIcon>
              {sidebarOpen && <ListItemText primary="Logout" slotProps={{ primary: { style: { fontSize: 14, color: "#EF4444" } } }} />}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>

      {/* MAIN */}
      <Box sx={{ flex: 1, ml: sidebarOpen ? `${SIDEBAR_WIDTH}px` : "72px", transition: "margin-left 0.25s ease", display: "flex", flexDirection: "column" }}>
        <Box sx={{ bgcolor: C.headerBg, borderBottom: `1px solid ${C.border}`, px: 3, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 99 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small" sx={{ color: C.textSecondary }}><MenuIcon /></IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: C.textPrimary, fontSize: 18 }}>{title}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
              <IconButton onClick={toggleMode} size="small" sx={{ color: C.textSecondary }}>
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <IconButton size="small" sx={{ color: C.textSecondary }}>
              <Badge badgeContent={2} color="error"><NotificationsIcon /></Badge>
            </IconButton>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "#D97706", fontSize: 13, cursor: "pointer" }}>{initials}</Avatar>
          </Box>
        </Box>
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default TechnicianLayout;
