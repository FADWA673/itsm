import { useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import DevicesIcon from "@mui/icons-material/Devices";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import { PATHS } from "../../routes/paths";
import { useAuthStore } from "../../store";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  drawerWidth: number;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: PATHS.DASHBOARD,
    icon: <DashboardIcon />,
  },
  {
    label: "Tickets",
    path: PATHS.TICKETS,
    icon: <ConfirmationNumberIcon />,
  },
  {
    label: "Assets",
    path: PATHS.ASSETS,
    icon: <DevicesIcon />,
  },
];

const ADMIN_ITEMS: NavItem[] = [
  {
    label: "Administration",
    path: PATHS.ADMIN,
    icon: <AdminPanelSettingsIcon />,
    roles: ["admin", "super_admin"],
  },
];

/**
 * Sidebar de navigation.
 * Sur desktop : drawer permanent.
 * Sur mobile : drawer temporaire avec overlay.
 */
function Sidebar({ open, onClose, drawerWidth }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, hasRole } = useAuthStore();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate(PATHS.LOGIN);
  };

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        py: 2,
      }}
    >
      {/* Logo / Nom de l'app */}
      <Box px={3} pb={2}>
        <Typography variant="h6" fontWeight={700} color="primary">
          ITSM
        </Typography>
        <Typography variant="caption" color="text.secondary">
          IT Service Management
        </Typography>
      </Box>

      <Divider />

      {/* Navigation principale */}
      <List sx={{ flex: 1, pt: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              selected={isActive}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                  "&:hover": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* Navigation admin */}
      <List>
        {ADMIN_ITEMS.filter(
          (item) =>
            !item.roles || item.roles.some((role) => hasRole(role))
        ).map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            selected={location.pathname.startsWith(item.path)}
            sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}

        {/* Logout */}
        <ListItemButton
          onClick={handleLogout}
          sx={{ mx: 1, borderRadius: 2, color: "error.main" }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile : drawer temporaire */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop : drawer permanent */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;
