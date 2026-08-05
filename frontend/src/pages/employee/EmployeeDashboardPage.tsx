import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import { useAuthStore } from "../../store";
import EmployeeLayout from "../../layouts/EmployeeLayout";

const STATS = [
  { label: "Open Tickets", value: "5", desc: "Currently assigned to you", color: "#2563EB" },
  { label: "In Progress", value: "2", desc: "Currently assigned to you", color: "#F59E0B" },
  { label: "Resolved", value: "15", desc: "Currently assigned to you", color: "#10B981" },
  { label: "Pending Response", value: "1", desc: "Currently assigned to you", color: "#EF4444" },
];

const RECENT_TICKETS = [
  { id: "INC-2026-000001", subject: "Cannot login to ERP", category: "Software", priority: "High", status: "In Progress", created: "15 Jul", updated: "Today" },
  { id: "INC-2026-000002", subject: "Printer not responding", category: "Hardware", priority: "Medium", status: "Open", created: "14 Jul", updated: "Yesterday" },
  { id: "INC-2026-000003", subject: "VPN connection failed", category: "Network", priority: "High", status: "Waiting for User", created: "13 Jul", updated: "2 days ago" },
  { id: "INC-2026-000004", subject: "Outlook keeps crashing", category: "Software", priority: "Low", status: "Resolved", created: "10 Jul", updated: "10 Jul" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#FEF3C7", text: "#D97706" },
  "Open": { bg: "#EFF6FF", text: "#2563EB" },
  "Waiting for User": { bg: "#F3E8FF", text: "#7C3AED" },
  "Resolved": { bg: "#ECFDF5", text: "#059669" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FEF2F2", text: "#DC2626" },
  Medium: { bg: "#FFFBEB", text: "#D97706" },
  Low: { bg: "#ECFDF5", text: "#059669" },
};

function EmployeeDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <EmployeeLayout>
      {/* Welcome */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
          Here's an overview of your IT support requests.
        </Typography>
      </Paper>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 2, mb: 3 }}>
        {STATS.map((stat) => (
          <Paper key={stat.label} elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 1 }}>{stat.label}</Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</Typography>
            <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 1 }}>{stat.desc}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Quick Actions + Knowledge Base */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
        {/* Quick Actions */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111827", mb: 2 }}>Quick Actions</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              { label: "Create Ticket", icon: <AddIcon fontSize="small" />, color: "#2563EB", path: "/employee/create-ticket" },
              { label: "My Tickets", icon: <ConfirmationNumberIcon fontSize="small" />, color: "#059669", path: "/employee/tickets" },
              { label: "Knowledge Base", icon: <MenuBookIcon fontSize="small" />, color: "#D97706", path: "/employee/knowledge-base" },
              { label: "Profile", icon: <PersonIcon fontSize="small" />, color: "#7C3AED", path: "/employee/profile" },
            ].map((action) => (
              <Box key={action.label} onClick={() => navigate(action.path)} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.2, borderRadius: 1.5, cursor: "pointer", "&:hover": { bgcolor: "#F9FAFB" } }}>
                <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: `${action.color}20`, display: "flex", alignItems: "center", justifyContent: "center", color: action.color }}>{action.icon}</Box>
                <Typography sx={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{action.label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Knowledge Base */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111827", mb: 0.5 }}>Knowledge Base</Typography>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 2 }}>Search for a solution before creating a ticket.</Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField size="small" placeholder="Search articles..." fullWidth slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment> } }} />
            <Button variant="contained" sx={{ bgcolor: "#2563EB", textTransform: "none", fontWeight: 600, whiteSpace: "nowrap", "&:hover": { bgcolor: "#1D4ED8" } }}>Search</Button>
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 1 }}>Suggested Articles</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {[
              { label: "Reset Password", color: "#EF4444" },
              { label: "VPN Connection Guide", color: "#10B981" },
              { label: "Printer Troubleshooting", color: "#2563EB" },
            ].map((a) => (
              <Box key={a.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: a.color }} />
                <Typography sx={{ fontSize: 12, color: "#2563EB", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>{a.label}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Recent Tickets */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Recent Tickets</Typography>
          <Typography onClick={() => navigate("/employee/tickets")} sx={{ fontSize: 13, color: "#2563EB", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>View All</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr", px: 3, py: 1.5, borderBottom: "1px solid #F3F4F6", bgcolor: "#F9FAFB" }}>
          {["Ticket ID", "Subject", "Category", "Priority", "Status", "Created", "Updated", "Actions"].map((h) => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{h}</Typography>
          ))}
        </Box>
        {RECENT_TICKETS.map((ticket, i) => (
          <Box key={ticket.id} sx={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr", px: 3, py: 1.5, borderBottom: i < RECENT_TICKETS.length - 1 ? "1px solid #F3F4F6" : "none", alignItems: "center", "&:hover": { bgcolor: "#F9FAFB" } }}>
            <Typography sx={{ fontSize: 12, fontFamily: "monospace", color: "#374151" }}>{ticket.id}</Typography>
            <Typography sx={{ fontSize: 13, color: "#111827" }}>{ticket.subject}</Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{ticket.category}</Typography>
            <Chip label={ticket.priority} size="small" sx={{ bgcolor: PRIORITY_COLORS[ticket.priority]?.bg, color: PRIORITY_COLORS[ticket.priority]?.text, fontWeight: 600, fontSize: 11, height: 22 }} />
            <Chip label={ticket.status} size="small" sx={{ bgcolor: STATUS_COLORS[ticket.status]?.bg, color: STATUS_COLORS[ticket.status]?.text, fontWeight: 600, fontSize: 11, height: 22 }} />
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{ticket.created}</Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{ticket.updated}</Typography>
            <Typography sx={{ fontSize: 12, color: "#2563EB", cursor: "pointer", fontWeight: 600 }}>View</Typography>
          </Box>
        ))}
      </Paper>
    </EmployeeLayout>
  );
}

export default EmployeeDashboardPage;
