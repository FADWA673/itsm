import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import SecurityIcon from "@mui/icons-material/Security";
import CategoryIcon from "@mui/icons-material/Category";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { PATHS } from "./paths";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, path: PATHS.ADMIN_DASHBOARD },
  { label: "All Tickets", icon: <ConfirmationNumberIcon />, path: PATHS.ADMIN_TICKETS },
  { label: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
  { label: "Manage KB Articles", icon: <MenuBookIcon />, path: PATHS.ADMIN_KB_ARTICLES },
  { label: "Categories", icon: <CategoryIcon />, path: "/admin/categories" },
  { label: "Roles & Permissions", icon: <SecurityIcon />, path: "/admin/roles" },
  { label: "SLA & Notifications", icon: <NotificationsIcon />, path: "/admin/sla" },
  { label: "System Settings", icon: <SettingsIcon />, path: "/admin/settings" },
];
