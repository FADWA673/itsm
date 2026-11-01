import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import { useAuthStore } from "../../store";
import { getAllTicketsApi, type TicketDTO } from "../../services/tickets.service";
import { PATHS, buildPath } from "../../routes/paths";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#EFF6FF", text: "#2563EB" },
  IN_PROGRESS: { bg: "#FEF3C7", text: "#D97706" },
  WAITING_FOR_USER: { bg: "#F3E8FF", text: "#7C3AED" },
  RESOLVED: { bg: "#ECFDF5", text: "#059669" },
  CLOSED: { bg: "#F3F4F6", text: "#6B7280" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  HIGH: { bg: "#FEE2E2", text: "#DC2626" },
  MEDIUM: { bg: "#FEF3C7", text: "#D97706" },
  LOW: { bg: "#ECFDF5", text: "#059669" },
  CRITICAL: { bg: "#FDF2F8", text: "#9D174D" },
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatSlaRemaining(ticket: TicketDTO) {
  const hoursMap: Record<string, number> = { CRITICAL: 1, HIGH: 4, MEDIUM: 8, LOW: 24 };
  const slaHours = hoursMap[ticket.priority] ?? 8;
  const elapsed = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  const remaining = Math.max(0, slaHours - elapsed);
  const h = Math.floor(remaining);
  const m = Math.round((remaining - h) * 60);
  return `${h}h ${m}m`;
}

function formatSlaAlert(ticket: TicketDTO) {
  const hoursMap: Record<string, number> = { CRITICAL: 1, HIGH: 4, MEDIUM: 8, LOW: 24 };
  const slaHours = hoursMap[ticket.priority] ?? 8;
  const elapsed = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  const remaining = Math.max(0, slaHours - elapsed);
  const mins = Math.round(remaining * 60);
  if (mins < 60) return `${mins} min remaining`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m remaining`;
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function TechnicianDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    getAllTicketsApi()
      .then((all) => {
        if (!cancelled) {
          const myTickets = all.filter((t) => String(t.assignedToId) === String(user.id));
          setTickets(myTickets);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!user) {
    return (
      <TechnicianLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#6B7280" }} />
        </Box>
      </TechnicianLayout>
    );
  }

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const assigned = tickets.length;
  const open = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const slaAtRisk = tickets.filter((t) =>
    ["OPEN", "IN_PROGRESS"].includes(t.status) && (t.priority === "HIGH" || t.priority === "CRITICAL")
  ).length;
  const resolvedToday = tickets.filter((t) =>
    t.status === "RESOLVED" && t.resolvedAt && new Date(t.resolvedAt).toDateString() === today
  ).length;
  const assignedYesterday = tickets.filter((t) =>
    new Date(t.createdAt).toDateString() === yesterday
  ).length;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const STATS = [
    { label: "Assigned Tickets", value: String(assigned), sub: assignedYesterday > 0 ? `+${assignedYesterday} from yesterday` : "No change from yesterday" },
    { label: "Open Tickets", value: String(open), sub: "Awaiting action" },
    { label: "SLA At Risk", value: String(slaAtRisk), sub: "Needs attention" },
    { label: "Resolved Today", value: String(resolvedToday), sub: "Completed today" },
  ];

  const activeTickets = tickets.filter((t) => !["RESOLVED", "CLOSED"].includes(t.status));
  const recentTickets = activeTickets.slice(0, 5);
  const slaAlerts = activeTickets
    .filter((t) => t.priority === "HIGH" || t.priority === "CRITICAL")
    .slice(0, 3);
  const recentActivity = tickets
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const QUICK_ACTIONS = [
    { label: "Create Ticket", path: PATHS.EMPLOYEE_CREATE_TICKET },
    { label: "View Queue", path: "/technician/queue" },
    { label: "Knowledge Base", path: "/technician/kb" },
    { label: "Add Knowledge Article", path: "/technician/kb" },
    { label: "Manage Assets", path: "/technician/assets" },
  ];

  const tableCols = "1.2fr 2fr 0.9fr 1fr 1.2fr 0.8fr 0.8fr 0.7fr";

  return (
    <TechnicianLayout>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5, fontSize: 28 }}>
            Technician Dashboard
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
            Welcome back, {user?.firstName || "Technician"}! Here&apos;s your overview for today.
          </Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: 13, mt: 0.5 }}>{dateLabel}</Typography>
        </Box>
        <Chip
          label="Available"
          sx={{
            bgcolor: "#F3F4F6",
            color: "#374151",
            fontWeight: 500,
            fontSize: 13,
            border: "1px solid #E5E7EB",
            borderRadius: "20px",
            px: 1,
          }}
        />
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 2, mb: 3 }}>
        {STATS.map((stat) => (
          <Paper key={stat.label} elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1.5 }}>{stat.label}</Typography>
            <Typography sx={{ fontSize: 40, fontWeight: 700, color: "#1F2937", lineHeight: 1, mb: 1 }}>{stat.value}</Typography>
            <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>{stat.sub}</Typography>
          </Paper>
        ))}
      </Box>

      {/* My Assigned Tickets */}
      <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, mb: 3, overflow: "hidden", bgcolor: "white" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937" }}>My Assigned Tickets</Typography>
          <Button
            size="small"
            onClick={() => navigate(PATHS.TECHNICIAN_TICKETS)}
            sx={{ textTransform: "none", color: "#374151", fontWeight: 500, fontSize: 13, border: "1px solid #E5E7EB", borderRadius: 1.5, px: 2 }}
          >
            View All ({assigned})
          </Button>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: tableCols, px: 3, py: 1.5, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          {["Ticket ID", "Title", "Priority", "Status", "Requester", "Created", "SLA", "Action"].map((h) => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{h}</Typography>
          ))}
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : recentTickets.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ color: "#9CA3AF", fontSize: 14 }}>No assigned tickets yet.</Typography>
          </Box>
        ) : recentTickets.map((ticket, i) => (
          <Box
            key={ticket.id}
            sx={{
              display: "grid",
              gridTemplateColumns: tableCols,
              px: 3,
              py: 2,
              borderBottom: i < recentTickets.length - 1 ? "1px solid #F3F4F6" : "none",
              alignItems: "center",
              "&:hover": { bgcolor: "#F9FAFB" },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>{ticket.ticketNumber}</Typography>
            <Typography sx={{ fontSize: 13, color: "#1F2937" }}>{ticket.subject}</Typography>
            <Chip label={ticket.priority} size="small" sx={{ bgcolor: PRIORITY_COLORS[ticket.priority]?.bg, color: PRIORITY_COLORS[ticket.priority]?.text, fontWeight: 600, fontSize: 11, height: 22, width: "fit-content" }} />
            <Chip label={ticket.status.replace(/_/g, " ")} size="small" sx={{ bgcolor: STATUS_COLORS[ticket.status]?.bg, color: STATUS_COLORS[ticket.status]?.text, fontWeight: 600, fontSize: 11, height: 22, width: "fit-content" }} />
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>{ticket.createdByName}</Typography>
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>{formatTime(ticket.createdAt)}</Typography>
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>{formatSlaRemaining(ticket)}</Typography>
            <Button
              size="small"
              onClick={() => navigate(buildPath(PATHS.TECHNICIAN_TICKET_DETAIL, { id: ticket.id }))}
              sx={{ textTransform: "none", color: "#2563EB", fontWeight: 600, justifyContent: "flex-start", p: 0, fontSize: 13 }}
            >
              View
            </Button>
          </Box>
        ))}
      </Paper>

      {/* SLA Alerts + Recent Activity */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
        <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, bgcolor: "white", overflow: "hidden" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937" }}>SLA Alerts</Typography>
            <Button size="small" sx={{ textTransform: "none", color: "#374151", fontWeight: 500, fontSize: 13, border: "1px solid #E5E7EB", borderRadius: 1.5, px: 2 }}>
              View All
            </Button>
          </Box>
          {slaAlerts.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>No SLA alerts</Typography>
            </Box>
          ) : slaAlerts.map((ticket, i) => (
            <Box
              key={ticket.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                py: 2,
                borderBottom: i < slaAlerts.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#DC2626", flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937", flexShrink: 0 }}>{ticket.ticketNumber}</Typography>
                <Typography noWrap sx={{ fontSize: 13, color: "#6B7280" }}>{ticket.subject}</Typography>
              </Box>
              <Chip
                label={formatSlaAlert(ticket)}
                size="small"
                sx={{ bgcolor: "#1F2937", color: "white", fontWeight: 500, fontSize: 11, height: 24, flexShrink: 0, ml: 2 }}
              />
            </Box>
          ))}
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, bgcolor: "white", overflow: "hidden" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937" }}>Recent Activity</Typography>
            <Button size="small" sx={{ textTransform: "none", color: "#374151", fontWeight: 500, fontSize: 13, border: "1px solid #E5E7EB", borderRadius: 1.5, px: 2 }}>
              View All
            </Button>
          </Box>
          {recentActivity.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>No recent activity</Typography>
            </Box>
          ) : recentActivity.map((ticket, i) => (
            <Box
              key={ticket.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                py: 2,
                borderBottom: i < recentActivity.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "#374151", flex: 1, pr: 2 }}>
                Ticket {ticket.ticketNumber} — {ticket.status.replace(/_/g, " ").toLowerCase()}
              </Typography>
              <Chip
                label={formatRelativeTime(ticket.updatedAt)}
                size="small"
                sx={{ bgcolor: "#F3F4F6", color: "#6B7280", fontWeight: 500, fontSize: 11, height: 24, flexShrink: 0 }}
              />
            </Box>
          ))}
        </Paper>
      </Box>

      {/* Quick Actions */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937", mb: 2.5 }}>Quick Actions</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2 }}>
          {QUICK_ACTIONS.map((action) => (
            <Box
              key={action.label}
              onClick={() => navigate(action.path)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                p: 2.5,
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                cursor: "pointer",
                bgcolor: "white",
                "&:hover": { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
              }}
            >
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                <AddIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500, textAlign: "center" }}>
                {action.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </TechnicianLayout>
  );
}

export default TechnicianDashboardPage;
