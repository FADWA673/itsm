import { type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ListAltIcon from "@mui/icons-material/ListAlt";
import QueueIcon from "@mui/icons-material/Queue";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuthStore } from "../store";
import { PATHS } from "../routes/paths";
import { LanguageSelector } from "../components/LanguageSelector";

const SIDEBAR_WIDTH = 220;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface TechnicianLayoutProps {
  children: ReactNode;
}

function TechnicianLayout({ children }: TechnicianLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: PATHS.TECHNICIAN_DASHBOARD },
    { label: "My Tickets", icon: <ConfirmationNumberIcon fontSize="small" />, path: PATHS.TECHNICIAN_TICKETS },
    { label: "Queue", icon: <QueueIcon fontSize="small" />, path: PATHS.TECHNICIAN_QUEUE },
    { label: "Knowledge Base", icon: <MenuBookIcon fontSize="small" />, path: PATHS.TECHNICIAN_KB },
    { label: "Assets", icon: <BusinessCenterIcon fontSize="small" />, path: PATHS.TECHNICIAN_ASSETS },
    { label: "Reports", icon: <AssessmentIcon fontSize="small" />, path: "/technician/reports" },
  ];

  const isSettingsActive = location.pathname === PATHS.TECHNICIAN_SETTINGS;

  const handleLogout = () => { 
    logout(); 
    navigate(PATHS.LOGIN); 
  };

  const firstName = user?.firstName ? String(user.firstName) : "Technicien";
  const lastName = user?.lastName ? String(user.lastName) : "";
  const userInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#ffffff" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: "#ffffff",
          borderRight: "1px solid #E5E7EB",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ color: "#2563EB", fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
            ITSM
          </Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: 11, mt: 0.3 }}>
            IT Service Management System
          </Typography>
        </Box>

        {/* Navigation */}
        <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: 1.5,
                  py: 1,
                  bgcolor: isActive ? "#2563EB" : "transparent",
                  "&:hover": { bgcolor: isActive ? "#2563EB" : "#F3F4F6" },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? "white" : "#6B7280", minWidth: 32 }}>
                  {item.icon}
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

        {/* Settings */}
        <Box sx={{ px: 1.5, pb: 1 }}>
          <ListItemButton
            onClick={() => navigate(PATHS.TECHNICIAN_SETTINGS)}
            sx={{
              borderRadius: 2,
              px: 1.5,
              py: 1,
              bgcolor: isSettingsActive ? "#2563EB" : "transparent",
              "&:hover": { bgcolor: isSettingsActive ? "#2563EB" : "#F3F4F6" },
            }}
          >
            <ListItemIcon sx={{ color: isSettingsActive ? "white" : "#6B7280", minWidth: 32 }}>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              slotProps={{
                primary: {
                  style: {
                    fontSize: 14,
                    fontWeight: isSettingsActive ? 600 : 400,
                    color: isSettingsActive ? "white" : "#374151",
                  },
                },
              }}
            />
          </ListItemButton>
        </Box>

        <Divider />

        {/* Logout */}
        <Box sx={{ px: 1.5, py: 1.5 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              px: 1.5,
              py: 1,
              "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
            }}
          >
            <ListItemIcon sx={{ color: "#EF4444", minWidth: 32 }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              slotProps={{
                primary: {
                  style: {
                    fontSize: 14,
                    color: "#EF4444",
                  },
                },
              }}
            />
          </ListItemButton>
        </Box>

      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, ml: `${SIDEBAR_WIDTH}px`, display: "flex", flexDirection: "column" }}>
        {/* Header with Language Selector */}
        <Box sx={{
          bgcolor: "#ffffff",
          borderBottom: "1px solid #E5E7EB",
          px: 3, py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 99,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#374151", fontSize: 18 }}>
            Technicien
          </Typography>
          <LanguageSelector />
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, bgcolor: "#F9FAFB" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default TechnicianLayout;
