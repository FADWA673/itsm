import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import { getAdminColors } from "../../styles/adminTheme";
import { useAuthStore, useThemeStore } from "../../store";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const STATS = [
  { label: "Dept. Tickets", value: "—", icon: <ConfirmationNumberIcon />, color: "#2563EB", bg: "#EFF6FF" },
  { label: "Open Tickets", value: "—", icon: <TrendingUpIcon />, color: "#D97706", bg: "#FFFBEB" },
  { label: "Team Members", value: "—", icon: <PeopleIcon />, color: "#059669", bg: "#ECFDF5" },
  { label: "Reports", value: "—", icon: <BarChartIcon />, color: "#7C3AED", bg: "#F5F3FF" },
];

const MOCK_TICKETS = [
  { id: "TK-005", title: "Computer replacement request", priority: "Medium", status: "Open", created: "1h ago" },
  { id: "TK-006", title: "Software license needed for HR", priority: "Low", status: "Open", created: "3h ago" },
  { id: "TK-007", title: "Meeting room projector issue", priority: "High", status: "In Progress", created: "2d ago" },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FEF2F2", text: "#DC2626" },
  Medium: { bg: "#FFFBEB", text: "#D97706" },
  Low: { bg: "#ECFDF5", text: "#059669" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Open": { bg: "#EFF6FF", text: "#2563EB" },
  "In Progress": { bg: "#FFFBEB", text: "#D97706" },
  "Resolved": { bg: "#ECFDF5", text: "#059669" },
};

function DeptManagerDashboardPage() {
  const { user } = useAuthStore();
  const { mode } = useThemeStore();
  const C = getAdminColors(mode);

  return (
    <TechnicianLayout title="Department Manager Dashboard">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: C.textPrimary }}>
          Welcome, {user?.firstName} 🏢
        </Typography>
        <Typography variant="body2" sx={{ color: C.textSecondary, mt: 0.5 }}>
          Monitor your department tickets and team activity.
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
        {STATS.map((stat) => (
          <Paper key={stat.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.cardBg, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, flexShrink: 0 }}>{stat.icon}</Box>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: 12, color: C.textSecondary, mt: 0.5 }}>{stat.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.textPrimary, mb: 2 }}>Department Tickets</Typography>
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr 1fr 1fr", px: 3, py: 1.5, bgcolor: "#F8FAFC", borderBottom: `1px solid ${C.border}` }}>
          {["ID", "Title", "Priority", "Status", "Created"].map((h) => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase" }}>{h}</Typography>
          ))}
        </Box>
        {MOCK_TICKETS.map((ticket, i) => (
          <Box key={ticket.id} sx={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr 1fr 1fr", px: 3, py: 2, borderBottom: i < MOCK_TICKETS.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center", "&:hover": { bgcolor: "#F8FAFC" } }}>
            <Typography sx={{ fontSize: 12, fontFamily: "monospace", color: "#2563EB", fontWeight: 600 }}>{ticket.id}</Typography>
            <Typography sx={{ fontSize: 14, color: C.textPrimary, fontWeight: 500 }}>{ticket.title}</Typography>
            <Chip label={ticket.priority} size="small" sx={{ bgcolor: PRIORITY_COLORS[ticket.priority].bg, color: PRIORITY_COLORS[ticket.priority].text, fontWeight: 600, fontSize: 11 }} />
            <Chip label={ticket.status} size="small" sx={{ bgcolor: STATUS_COLORS[ticket.status].bg, color: STATUS_COLORS[ticket.status].text, fontWeight: 600, fontSize: 11 }} />
            <Typography sx={{ fontSize: 12, color: C.textSecondary }}>{ticket.created}</Typography>
          </Box>
        ))}
      </Paper>
    </TechnicianLayout>
  );
}

export default DeptManagerDashboardPage;
