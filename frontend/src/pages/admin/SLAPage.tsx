import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";

/**
 * SLA = Service Level Agreement
 * Définit le délai maximum de réponse/résolution par niveau de priorité.
 * Ex: Un ticket "Critique" doit être résolu en max 4h.
 */
const SLA_POLICIES = [
  { priority: "Critical", icon: "🔴", responseTime: "1 hour", resolutionTime: "4 hours", escalation: "2 hours", color: "#DC2626" },
  { priority: "High", icon: "🟠", responseTime: "2 hours", resolutionTime: "8 hours", escalation: "4 hours", color: "#D97706" },
  { priority: "Medium", icon: "🟡", responseTime: "4 hours", resolutionTime: "24 hours", escalation: "12 hours", color: "#F59E0B" },
  { priority: "Low", icon: "🟢", responseTime: "8 hours", resolutionTime: "72 hours", escalation: "48 hours", color: "#059669" },
];

const NOTIFICATION_SETTINGS = [
  { label: "Email Notifications", desc: "Send email alerts when tickets are assigned or updated", enabled: true },
  { label: "Browser Notifications", desc: "Show browser push notifications for urgent tickets", enabled: true },
  { label: "SLA Breach Alerts", desc: "Notify manager when SLA deadline is approaching (80%)", enabled: true },
  { label: "Escalation Rules", desc: "Auto-escalate tickets that exceed resolution time", enabled: false },
];

function SLAPage() {
  return (
    <AdminLayout title="SLA & Notifications">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>SLA & Notifications</Typography>
        <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
          SLA (Service Level Agreement) — defines maximum response and resolution times for each priority level
        </Typography>
      </Box>

      {/* SLA Policies */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, mb: 2 }}>SLA Policies</Typography>
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, overflow: "hidden", mb: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", px: 3, py: 1.5, bgcolor: "#F8FAFC", borderBottom: `1px solid ${ADMIN_COLORS.border}` }}>
          {["Priority", "First Response", "Resolution", "Escalation After"].map((h) => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: ADMIN_COLORS.textSecondary, textTransform: "uppercase" }}>{h}</Typography>
          ))}
        </Box>
        {SLA_POLICIES.map((sla, i) => (
          <Box key={sla.priority} sx={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", px: 3, py: 2, borderBottom: i < SLA_POLICIES.length - 1 ? `1px solid ${ADMIN_COLORS.border}` : "none", alignItems: "center", "&:hover": { bgcolor: "#F8FAFC" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>{sla.icon}</Typography>
              <Chip label={sla.priority} size="small" sx={{ bgcolor: `${sla.color}15`, color: sla.color, fontWeight: 600 }} />
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textPrimary }}>{sla.responseTime}</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textPrimary }}>{sla.resolutionTime}</Typography>
            <Typography sx={{ fontSize: 14, color: ADMIN_COLORS.textSecondary }}>{sla.escalation}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Notifications */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, mb: 2 }}>Notification Settings</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NOTIFICATION_SETTINGS.map((notif) => (
          <Paper key={notif.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: ADMIN_COLORS.textPrimary }}>{notif.label}</Typography>
              <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>{notif.desc}</Typography>
            </Box>
            <Chip label={notif.enabled ? "Enabled" : "Disabled"} size="small" sx={{ bgcolor: notif.enabled ? "#ECFDF5" : "#F1F5F9", color: notif.enabled ? "#059669" : "#6B7280", fontWeight: 600 }} />
          </Paper>
        ))}
      </Box>
    </AdminLayout>
  );
}

export default SLAPage;
