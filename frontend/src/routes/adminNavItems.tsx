import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import CategoryIcon from "@mui/icons-material/Category";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import { PATHS } from "./paths";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, path: PATHS.ADMIN_DASHBOARD },
  { label: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
  { label: "Roles & Permissions", icon: <SecurityIcon />, path: "/admin/roles" },
  { label: "Ticket Categories", icon: <CategoryIcon />, path: "/admin/categories" },
  { label: "SLA & Notifications", icon: <NotificationsIcon />, path: "/admin/sla" },
  { label: "Audit Logs", icon: <HistoryIcon />, path: "/admin/audit" },
  { label: "System Settings", icon: <SettingsIcon />, path: "/admin/settings" },
];
