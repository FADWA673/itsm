import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";

const LOGS = [
  { id: 1, user: "Admin ITSM", action: "AUTH_LOGIN", detail: "Successful login from 127.0.0.1", time: "10:32 AM", type: "success" },
  { id: 2, user: "Ahmed Employé", action: "AUTH_LOGIN", detail: "Successful login from 127.0.0.1", time: "09:15 AM", type: "success" },
  { id: 3, user: "Unknown", action: "AUTH_LOGIN_FAILED", detail: "Failed login attempt for test@test.com", time: "08:47 AM", type: "error" },
  { id: 4, user: "Sara Technicien", action: "AUTH_LOGIN", detail: "Successful login from 127.0.0.1", time: "08:30 AM", type: "success" },
  { id: 5, user: "Admin ITSM", action: "USER_CREATED", detail: "Created user employee@gmail.com", time: "Yesterday", type: "info" },
  { id: 6, user: "Admin ITSM", action: "USER_UPDATED", detail: "Updated role for tech@gmail.com", time: "Yesterday", type: "info" },
  { id: 7, user: "Unknown", action: "AUTH_TOKEN_INVALID", detail: "Invalid token from 192.168.1.5", time: "2 days ago", type: "warning" },
];

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  success: { bg: "#ECFDF5", text: "#059669", label: "Success" },
  error: { bg: "#FEF2F2", text: "#DC2626", label: "Failed" },
  info: { bg: "#EFF6FF", text: "#2563EB", label: "Info" },
  warning: { bg: "#FFFBEB", text: "#D97706", label: "Warning" },
};

function AuditLogsPage() {
  return (
    <AdminLayout title="Audit Logs">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>Audit Logs</Typography>
        <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
          Complete history of all user actions and system events
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, overflow: "hidden" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 3fr 1fr 1fr", px: 3, py: 1.5, bgcolor: "#F8FAFC", borderBottom: `1px solid ${ADMIN_COLORS.border}` }}>
          {["User", "Action", "Detail", "Time", "Status"].map((h) => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: ADMIN_COLORS.textSecondary, textTransform: "uppercase" }}>{h}</Typography>
          ))}
        </Box>
        {LOGS.map((log, i) => (
          <Box key={log.id} sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 3fr 1fr 1fr", px: 3, py: 2, borderBottom: i < LOGS.length - 1 ? `1px solid ${ADMIN_COLORS.border}` : "none", alignItems: "center", "&:hover": { bgcolor: "#F8FAFC" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: ADMIN_COLORS.primary }}>{log.user[0]}</Avatar>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: ADMIN_COLORS.textPrimary }}>{log.user}</Typography>
            </Box>
            <Typography sx={{ fontSize: 12, fontFamily: "monospace", color: ADMIN_COLORS.textSecondary }}>{log.action}</Typography>
            <Typography sx={{ fontSize: 13, color: ADMIN_COLORS.textSecondary }}>{log.detail}</Typography>
            <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary }}>{log.time}</Typography>
            <Chip label={TYPE_COLORS[log.type].label} size="small" sx={{ bgcolor: TYPE_COLORS[log.type].bg, color: TYPE_COLORS[log.type].text, fontWeight: 600, fontSize: 10 }} />
          </Box>
        ))}
      </Paper>
    </AdminLayout>
  );
}

export default AuditLogsPage;
