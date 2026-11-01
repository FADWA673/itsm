import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import CategoryIcon from "@mui/icons-material/Category";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import GroupIcon from "@mui/icons-material/Group";
import { useAuthStore } from "../../store";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";
import { getAllTicketsApi } from "../../services/tickets.service";
import { getUsers } from "../../services/users.service";
import { getStatisticsApi, getTechnicianStatisticsApi, type RatingStatistics, type TechnicianStatistics } from "../../services/ratings.service";
import { getDashboardStatistics, type DashboardStatistics } from "../../services/statistics.service";
import { PATHS } from "../../routes/paths";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import TicketsByStatusChart from "../../components/charts/TicketsByStatusChart";
import TicketsOverTimeChart from "../../components/charts/TicketsOverTimeChart";
import TechnicianPerformanceChart from "../../components/charts/TechnicianPerformanceChart";
import SLAComplianceChart from "../../components/charts/SLAComplianceChart";

const ACTIONS = [
  { label: "All Tickets", desc: "View and manage all tickets", icon: <ConfirmationNumberIcon />, color: "#2563EB", path: PATHS.ADMIN_TICKETS },
  { label: "Manage Users", desc: "Create, edit, deactivate accounts", icon: <PeopleIcon />, color: "#059669", path: "/admin/users" },
  { label: "Roles & Permissions", desc: "Configure access levels", icon: <SecurityIcon />, color: "#7C3AED", path: "/admin/roles" },
  { label: "Categories", desc: "Manage categories for tickets and KB articles", icon: <CategoryIcon />, color: "#059669", path: "/admin/categories" },
  { label: "SLA & Notifications", desc: "Configure response time policies", icon: <TrendingUpIcon />, color: "#D97706", path: "/admin/sla" },
  { label: "System Settings", desc: "Platform configuration", icon: <SettingsIcon />, color: "#0369A1", path: "/admin/settings" },
];

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ total: "—", open: "—", resolved: "—", users: "—" });
  const [satisfactionStats, setSatisfactionStats] = useState<RatingStatistics | null>(null);
  const [technicianStats, setTechnicianStats] = useState<TechnicianStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [chartData, setChartData] = useState<DashboardStatistics>({
    byStatus: [],
    overTime: [],
    techPerformance: [],
    slaCompliance: { percentage: 0, total: 0, withinSLA: 0, breached: 0 },
  });

  useEffect(() => {
    Promise.all([getAllTicketsApi(), getUsers()])
      .then(([tickets, users]) => {
        const today = new Date().toDateString();
        setStats({
          total: String(tickets.length),
          open: String(tickets.filter((t) => t.status === "OPEN").length),
          resolved: String(tickets.filter((t) => t.status === "RESOLVED" && t.resolvedAt && new Date(t.resolvedAt).toDateString() === today).length),
          users: String(users.length),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Charger les statistiques de satisfaction
    Promise.all([getStatisticsApi(), getTechnicianStatisticsApi()])
      .then(([satisfaction, technicians]) => {
        setSatisfactionStats(satisfaction);
        setTechnicianStats(technicians);
      })
      .catch(() => {})
      .finally(() => setLoadingRatings(false));

    // Charger les données des graphiques
    getDashboardStatistics()
      .then((data) => {
        setChartData(data);
      })
      .catch((error) => {
        console.error('Failed to load chart data:', error);
      })
      .finally(() => setLoadingCharts(false));
  }, []);

  const STATS = [
    { label: "Total Tickets", value: stats.total, icon: <ConfirmationNumberIcon />, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Open Tickets", value: stats.open, icon: <HourglassEmptyIcon />, color: "#F59E0B", bg: "#FFFBEB" },
    { label: "Resolved Today", value: stats.resolved, icon: <CheckCircleIcon />, color: "#10B981", bg: "#ECFDF5" },
    { label: "Total Users", value: stats.users, icon: <GroupIcon />, color: "#8B5CF6", bg: "#F5F3FF" },
  ];

  return (
    <AdminLayout title="Administrator Dashboard">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>
          Welcome back, {user?.firstName} 👋
        </Typography>
        <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
          Here's what's happening in your ITSM platform today.
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
        {STATS.map((stat) => (
          <Paper key={stat.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, flexShrink: 0 }}>{stat.icon}</Box>
            <Box>
              {loading ? <CircularProgress size={20} /> : (
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: ADMIN_COLORS.textPrimary, lineHeight: 1 }}>{stat.value}</Typography>
              )}
              <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>{stat.label}</Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Analytics Charts */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, mb: 2, mt: 1 }}>
        📊 Analytics & Performance
      </Typography>
      {loadingCharts ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3, mb: 3 }}>
            {/* Tickets by Status */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 2 }}>
                Tickets by Status
              </Typography>
              <TicketsByStatusChart data={chartData.byStatus} />
            </Paper>

            {/* SLA Compliance */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 2 }}>
                SLA Compliance
              </Typography>
              <SLAComplianceChart {...chartData.slaCompliance} />
            </Paper>
          </Box>

          {/* Tickets Over Time */}
          <Box sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 2 }}>
                Tickets Evolution (Last 7 Days)
              </Typography>
              <TicketsOverTimeChart data={chartData.overTime} />
            </Paper>
          </Box>

          {/* Technician Performance */}
          <Box sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 2 }}>
                Technician Performance
              </Typography>
              <TechnicianPerformanceChart data={chartData.techPerformance} />
            </Paper>
          </Box>
        </>
      )}

      {/* Satisfaction Stats */}
      {!loadingRatings && satisfactionStats && satisfactionStats.totalRatings > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, mb: 2 }}>
            ⭐ Satisfaction Client
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            {/* Global Satisfaction */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 2 }}>
                Satisfaction Globale
              </Typography>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Typography sx={{ fontSize: 48, fontWeight: 800, color: "#F59E0B", lineHeight: 1 }}>
                  {satisfactionStats.averageRating.toFixed(1)}
                </Typography>
                <Box>
                  <Rating value={satisfactionStats.averageRating} precision={0.1} readOnly size="large" />
                  <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
                    Basé sur {satisfactionStats.totalRatings} évaluation{satisfactionStats.totalRatings > 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>

              {/* Distribution */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = satisfactionStats.distribution[star as keyof typeof satisfactionStats.distribution];
                  const percent = satisfactionStats.percentages[star as keyof typeof satisfactionStats.percentages];
                  return (
                    <Box key={star} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 60 }}>
                        <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary }}>{star}</Typography>
                        <StarIcon sx={{ fontSize: 14, color: "#F59E0B" }} />
                      </Box>
                      <Box sx={{ flex: 1, height: 8, bgcolor: "#F3F4F6", borderRadius: 1, overflow: "hidden" }}>
                        <Box sx={{ width: `${percent}%`, height: "100%", bgcolor: "#F59E0B", transition: "width 0.3s" }} />
                      </Box>
                      <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary, minWidth: 50, textAlign: "right" }}>
                        {percent}% ({count})
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            {/* Top Technicians */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 2 }}>
                Top Techniciens
              </Typography>
              
              {technicianStats.length === 0 ? (
                <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary, textAlign: "center", py: 4 }}>
                  Aucune évaluation de technicien disponible
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {technicianStats.slice(0, 5).map((tech, index) => (
                    <Box key={tech.technicianId} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: "50%", 
                        bgcolor: index === 0 ? "#F59E0B15" : "#F3F4F6",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        color: index === 0 ? "#F59E0B" : ADMIN_COLORS.textSecondary,
                        fontWeight: 600,
                        fontSize: 12
                      }}>
                        #{index + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: ADMIN_COLORS.textPrimary }}>
                          {tech.technicianName}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: ADMIN_COLORS.textSecondary }}>
                          {tech.totalTickets} ticket{tech.totalTickets > 1 ? "s" : ""}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <StarIcon sx={{ fontSize: 16, color: "#F59E0B" }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#F59E0B" }}>
                          {tech.averageRating.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      )}

      {/* Quick Actions */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, mb: 2 }}>Quick Actions</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        {ACTIONS.map((action) => (
          <Paper key={action.label} elevation={0} onClick={() => navigate(action.path)} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: action.color, transform: "translateY(-2px)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${action.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: action.color, mb: 1.5 }}>{action.icon}</Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 0.5 }}>{action.label}</Typography>
            <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary }}>{action.desc}</Typography>
          </Paper>
        ))}
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
