import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import { useAuthStore } from "../../store";
import { getAllTicketsApi, type TicketDTO } from "../../services/tickets.service";

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

function ReportsPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAllTicketsApi()
      .then((all) => {
        if (!cancelled) setTickets(all);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <TechnicianLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#6B7280" }} />
        </Box>
      </TechnicianLayout>
    );
  }

  // Calculate statistics
  const totalTickets = tickets.length;
  const myTickets = tickets.filter((t) => String(t.assignedToId) === String(user?.id));
  
  // Status breakdown
  const byStatus = {
    OPEN: tickets.filter((t) => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    WAITING_FOR_USER: tickets.filter((t) => t.status === "WAITING_FOR_USER").length,
    RESOLVED: tickets.filter((t) => t.status === "RESOLVED").length,
    CLOSED: tickets.filter((t) => t.status === "CLOSED").length,
  };

  // Priority breakdown
  const byPriority = {
    CRITICAL: tickets.filter((t) => t.priority === "CRITICAL").length,
    HIGH: tickets.filter((t) => t.priority === "HIGH").length,
    MEDIUM: tickets.filter((t) => t.priority === "MEDIUM").length,
    LOW: tickets.filter((t) => t.priority === "LOW").length,
  };

  // Time periods
  const now = Date.now();
  const today = new Date().toDateString();
  const thisWeek = now - 7 * 24 * 60 * 60 * 1000;
  const thisMonth = now - 30 * 24 * 60 * 60 * 1000;

  const createdToday = tickets.filter((t) => new Date(t.createdAt).toDateString() === today).length;
  const createdThisWeek = tickets.filter((t) => new Date(t.createdAt).getTime() > thisWeek).length;
  const createdThisMonth = tickets.filter((t) => new Date(t.createdAt).getTime() > thisMonth).length;

  const resolvedToday = tickets.filter((t) => t.resolvedAt && new Date(t.resolvedAt).toDateString() === today).length;
  const resolvedThisWeek = tickets.filter((t) => t.resolvedAt && new Date(t.resolvedAt).getTime() > thisWeek).length;
  const resolvedThisMonth = tickets.filter((t) => t.resolvedAt && new Date(t.resolvedAt).getTime() > thisMonth).length;

  // My performance
  const myResolved = myTickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;
  const myInProgress = myTickets.filter((t) => t.status === "IN_PROGRESS").length;
  const myOpen = myTickets.filter((t) => t.status === "OPEN").length;

  // Calculate percentages for visual bars
  const maxStatus = Math.max(...Object.values(byStatus));
  const maxPriority = Math.max(...Object.values(byPriority));

  return (
    <TechnicianLayout>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5, fontSize: 28 }}>
          Reports & Analytics
        </Typography>
        <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
          Overview of ticket statistics and performance metrics
        </Typography>
      </Box>

      {/* Overview Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1.5 }}>Total Tickets</Typography>
          <Typography sx={{ fontSize: 40, fontWeight: 700, color: "#1F2937", lineHeight: 1, mb: 1 }}>
            {totalTickets}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>All time</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1.5 }}>My Tickets</Typography>
          <Typography sx={{ fontSize: 40, fontWeight: 700, color: "#1F2937", lineHeight: 1, mb: 1 }}>
            {myTickets.length}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Assigned to me</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1.5 }}>Active Tickets</Typography>
          <Typography sx={{ fontSize: 40, fontWeight: 700, color: "#D97706", lineHeight: 1, mb: 1 }}>
            {byStatus.OPEN + byStatus.IN_PROGRESS}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Open + In Progress</Typography>
        </Paper>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1.5 }}>Resolved</Typography>
          <Typography sx={{ fontSize: 40, fontWeight: 700, color: "#059669", lineHeight: 1, mb: 1 }}>
            {byStatus.RESOLVED + byStatus.CLOSED}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Resolved + Closed</Typography>
        </Paper>
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
        {/* Tickets by Status */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937", mb: 3 }}>
            Tickets by Status
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.entries(byStatus).map(([status, count]) => {
              const percentage = maxStatus > 0 ? (count / maxStatus) * 100 : 0;
              const colors = STATUS_COLORS[status];
              return (
                <Box key={status}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: colors?.text || "#6B7280",
                        }}
                      />
                      <Typography sx={{ fontSize: 13, color: "#1F2937", fontWeight: 500 }}>
                        {status.replace(/_/g, " ")}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>
                      {count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: "#F3F4F6",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: "100%",
                        bgcolor: colors?.text || "#6B7280",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* Tickets by Priority */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937", mb: 3 }}>
            Tickets by Priority
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.entries(byPriority).map(([priority, count]) => {
              const percentage = maxPriority > 0 ? (count / maxPriority) * 100 : 0;
              const colors = PRIORITY_COLORS[priority];
              return (
                <Box key={priority}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: colors?.text || "#6B7280",
                        }}
                      />
                      <Typography sx={{ fontSize: 13, color: "#1F2937", fontWeight: 500 }}>
                        {priority}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1F2937" }}>
                      {count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      bgcolor: "#F3F4F6",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: "100%",
                        bgcolor: colors?.text || "#6B7280",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>

      {/* Time Period Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937", mb: 3 }}>
            Tickets Created
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Today</Typography>
              <Chip
                label={createdToday}
                size="small"
                sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: 12, minWidth: 40 }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>This Week</Typography>
              <Chip
                label={createdThisWeek}
                size="small"
                sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: 12, minWidth: 40 }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>This Month</Typography>
              <Chip
                label={createdThisMonth}
                size="small"
                sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: 12, minWidth: 40 }}
              />
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937", mb: 3 }}>
            Tickets Resolved
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Today</Typography>
              <Chip
                label={resolvedToday}
                size="small"
                sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 600, fontSize: 12, minWidth: 40 }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>This Week</Typography>
              <Chip
                label={resolvedThisWeek}
                size="small"
                sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 600, fontSize: 12, minWidth: 40 }}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>This Month</Typography>
              <Chip
                label={resolvedThisMonth}
                size="small"
                sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 600, fontSize: 12, minWidth: 40 }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* My Performance */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1F2937", mb: 3 }}>
          My Performance
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1 }}>Assigned</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#1F2937" }}>
              {myTickets.length}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1 }}>Open</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#2563EB" }}>
              {myOpen}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1 }}>In Progress</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#D97706" }}>
              {myInProgress}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 1 }}>Resolved</Typography>
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: "#059669" }}>
              {myResolved}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </TechnicianLayout>
  );
}

export default ReportsPage;
