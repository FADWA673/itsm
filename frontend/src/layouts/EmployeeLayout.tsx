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
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { useAuthStore, useInAppNotificationStore } from "../store";
import { PATHS } from "../routes/paths";
import { LanguageSelector } from "../components/LanguageSelector";

const EMPLOYEE_NAV = [
  { label: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: PATHS.EMPLOYEE_DASHBOARD },
  { label: "My Tickets", icon: <ConfirmationNumberIcon fontSize="small" />, path: PATHS.EMPLOYEE_TICKETS },
  { label: "Create Ticket", icon: <AddCircleOutlinedIcon fontSize="small" />, path: PATHS.EMPLOYEE_CREATE_TICKET },
  { label: "Knowledge Base", icon: <MenuBookIcon fontSize="small" />, path: PATHS.EMPLOYEE_KNOWLEDGE_BASE },
  { label: "Notifications", icon: <NotificationsIcon fontSize="small" />, path: PATHS.EMPLOYEE_NOTIFICATIONS },
  { label: "Profile", icon: <PersonIcon fontSize="small" />, path: PATHS.EMPLOYEE_PROFILE },
];

const SIDEBAR_WIDTH = 220;

interface EmployeeLayoutProps {
  children: ReactNode;
}

function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { unreadCount, load, initialized } = useInAppNotificationStore();
  const [search, setSearch] = useState("");

  // Load notifications once when layout mounts (user is authenticated)
  useEffect(() => {
    if (!initialized) {
      load();
    }
  }, [initialized, load]);

  const handleLogout = () => { logout(); navigate(PATHS.LOGIN); };
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "E";
  const badgeCount = unreadCount;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#ffffff" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <Box sx={{
        width: SIDEBAR_WIDTH, flexShrink: 0, bgcolor: "#ffffff",
        borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column",
        position: "fixed", height: "100vh", zIndex: 100,
      }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ color: "#2563EB", fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
            ITSM
          </Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: 11, mt: 0.3 }}>
            IT Service Management System
          </Typography>
        </Box>

        <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
          {EMPLOYEE_NAV.map((item) => {
            const isActive = location.pathname === item.path;
            const isNotif = item.path === PATHS.EMPLOYEE_NOTIFICATIONS;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2, mb: 0.5, px: 1.5, py: 1,
                  bgcolor: isActive ? "#2563EB" : "transparent",
                  "&:hover": { bgcolor: isActive ? "#2563EB" : "#F3F4F6" },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "white" : "#6B7280", minWidth: 32 }}>
                  {isNotif && badgeCount > 0 ? (
                    <Badge badgeContent={badgeCount} color="error" max={99}>
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      style: {
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "white" : "#374151",
                      },
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Divider />
        <Box sx={{ px: 1.5, py: 1.5 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2, px: 1.5, py: 1, "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}
          >
            <ListItemIcon sx={{ color: "#EF4444", minWidth: 32 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              slotProps={{ primary: { style: { fontSize: 14, color: "#EF4444" } } }}
            />
          </ListItemButton>
        </Box>
      </Box>

      {/* ══ MAIN ═════════════════════════════════════════════════════════════ */}
      <Box sx={{ flex: 1, ml: `${SIDEBAR_WIDTH}px`, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <Box sx={{
          bgcolor: "#ffffff", borderBottom: "1px solid #E5E7EB",
          px: 3, py: 1.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 99,
        }}>
          <TextField
            size="small"
            placeholder="Search tickets, users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 280 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9CA3AF", fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Language Selector */}
            <LanguageSelector />

            {/* Notification bell → navigates to /employee/notifications */}
            <Tooltip title="Notifications">
              <IconButton
                size="small"
                onClick={() => navigate(PATHS.EMPLOYEE_NOTIFICATIONS)}
              >
                <Badge badgeContent={badgeCount || undefined} color="error" max={99}>
                  <NotificationsIcon sx={{ color: "#6B7280", fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Avatar + name → navigates to /employee/profile */}
            <Tooltip title="My profile">
              <Box
                onClick={() => navigate(PATHS.EMPLOYEE_PROFILE)}
                sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", borderRadius: 2, px: 1, py: 0.5, "&:hover": { bgcolor: "#F3F4F6" } }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#2563EB", fontSize: 13 }}>
                  {initials}
                </Avatar>
                <Typography sx={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
                  {user ? `${user.firstName} ${user.lastName}` : "Employee"}
                </Typography>
                <KeyboardArrowDownIcon sx={{ color: "#9CA3AF", fontSize: 16 }} />
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, bgcolor: "#F9FAFB" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default EmployeeLayout;
