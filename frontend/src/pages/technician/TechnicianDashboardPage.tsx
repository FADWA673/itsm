import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";
import { useAuthStore } from "../../store";
import AppLayout from "../../layouts/AppLayout";
import { getAdminColors } from "../../styles/adminTheme";
import { useThemeStore } from "../../store";

const ACCENT = "#D97706"; // Orange for Technician

const NAV = [
  { label: "Dashboard", icon: <DashboardIcon fontSize="small" />, path: "/technician/dashboard" },
  { label: "My Tickets", icon: <ConfirmationNumberIcon fontSize="small" />, path: "/technician/tickets" },
  { label: "Resolved", icon: <AssignmentTurnedInIcon fontSize="small" />, path: "/technician/resolved" },
  { label: "Profile", icon: <PersonIcon fontSize="small" />, path: "/technician/profile" },
];

const ASSIGNED_TICKETS = [
  { id: "TKT-001", title: "Network connection issue in Room 204", priority: "High", status: "In Progress", requester: "Ahmed Employé", created: "2h ago" },
  { id: "TKT-002", title: "Printer not responding on 3rd floor", priority: "Medium", status: "Open", requester: "Sara Manager", created: "4h ago" },
  { id: "TKT-003", title: "Cannot access company email", priority: "High", status: "In Progress", requester: "Karim Dept", created: "1d ago" },
  { id: "TKT-004", title: "Software installation request — Adobe", priority: "Low", status: "Open", requester: "Fatima Admin", created: "2d ago" },
];

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  High: { bg: "#FEF2F2", color: "#DC2626" },
  Medium: { bg: "#FFFBEB", color: "#D97706" },
  Low: { bg: "#ECFDF5", color: "#059669" },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "In Progress": { bg: "#EFF6FF", color: "#2563EB" },
  Open: { bg: "#FFFBEB", color: "#D97706" },
  Resolved: { bg: "#ECFDF5", color: "#059669" },
};

function TechnicianDashboardPage() {
  const { user } = useAuthStore();
  const { mode } = useThemeStore();
  const C = getAdminColors(mode);

  const stats = [
    { label: "Assigned", value: "4", icon: <ConfirmationNumberIcon />, color: ACCENT, bg: "#FFFBEB" },
    { label: "In Progress", value: "2", icon: <BuildIcon />, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Resolved Today", value: "1", icon: <AssignmentTurnedInIcon />, color: "#059669", bg: "#ECFDF5" },
    { label: "Overdue", value: "0", icon: <HourglassEmptyIcon />, color: "#DC2626", bg: "#FEF2F2" },
  ];

  return (
    <AppLayout title="Technician Dashboard" navItems={NAV} accentColor={ACCENT}>
      {/* Welcome */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: C.textPrimary }}>
          Welcome, {user?.firstName} 🔧
        </Typography>
        <Typography variant="body2" sx={{ color: C.textSecondary, mt: 0.5 }}>
          You have {ASSIGNED_TICKETS.filter(t => t.status !== "Resolved").length} active tickets to handle today.
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
        {stats.map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.cardBg, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>{s.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 12, color: C.textSecondary, mt: 0.5 }}>{s.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Assigned Tickets */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.textPrimary }}>Assigned Tickets</Typography>
        <Chip label="View all" size="small" sx={{ bgcolor: `${ACCENT}15`, color: ACCENT, fontWeight: 600, cursor: "pointer" }} />
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ display: "grid", gridTemplateColumns: "0.7fr 2.5fr 0.8fr 0.8fr 1fr 0.8fr", px: 3, py: 1.5, bgcolor: mode === "dark" ? "#1E293B" : "#F8FAFC", borderBottom: `1px solid ${C.border}` }}>
          {["ID", "Title", "Priority", "Status", "Requester", "Created"].map((h) => (
            <Typography key={h} sx={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</Typography>
          ))}
        </Box>

        {ASSIGNED_TICKETS.map((ticket, i) => (
          <Box key={ticket.id} sx={{ display: "grid", gridTemplateColumns: "0.7fr 2.5fr 0.8fr 0.8fr 1fr 0.8fr", px: 3, py: 2, borderBottom: i < ASSIGNED_TICKETS.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center", cursor: "pointer", "&:hover": { bgcolor: mode === "dark" ? "#1E293B" : "#F8FAFC" } }}>
            <Typography sx={{ fontSize: 12, fontFamily: "monospace", color: ACCENT, fontWeight: 600 }}>{ticket.id}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{ticket.title}</Typography>
            <Chip label={ticket.priority} size="small" sx={{ bgcolor: PRIORITY_COLORS[ticket.priority].bg, color: PRIORITY_COLORS[ticket.priority].color, fontWeight: 600, fontSize: 10 }} />
            <Chip label={ticket.status} size="small" sx={{ bgcolor: STATUS_COLORS[ticket.status].bg, color: STATUS_COLORS[ticket.status].color, fontWeight: 600, fontSize: 10 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: "#2563EB" }}>{ticket.requester[0]}</Avatar>
              <Typography sx={{ fontSize: 12, color: C.textSecondary }}>{ticket.requester}</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: C.textSecondary }}>{ticket.created}</Typography>
          </Box>
        ))}
      </Paper>
    </AppLayout>
  );
}

export default TechnicianDashboardPage;
