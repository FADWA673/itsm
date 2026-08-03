import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";

function SettingSection({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg, mb: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: ADMIN_COLORS.textPrimary }}>{title}</Typography>
      <Typography sx={{ fontSize: 13, color: ADMIN_COLORS.textSecondary, mt: 0.5, mb: 2.5 }}>{desc}</Typography>
      <Divider sx={{ mb: 2.5 }} />
      {children}
    </Paper>
  );
}

function SystemSettingsPage() {
  return (
    <AdminLayout title="System Settings">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>System Settings</Typography>
        <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
          Configure general platform settings
        </Typography>
      </Box>

      {/* Company Info */}
      <SettingSection title="Company Information" desc="Basic information about your organization">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField label="Company Name" defaultValue="Logismar" size="small" fullWidth />
          <TextField label="Domain" defaultValue="logismar.com" size="small" fullWidth />
          <TextField label="Admin Email" defaultValue="admin@logismar.com" size="small" fullWidth />
          <TextField label="Phone" defaultValue="+212 5XX XXX XXX" size="small" fullWidth />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Save Changes</Button>
        </Box>
      </SettingSection>

      {/* Working Hours */}
      <SettingSection title="Working Hours" desc="Define business hours for SLA calculations">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
          <TextField label="Start Time" defaultValue="08:00" size="small" type="time" fullWidth />
          <TextField label="End Time" defaultValue="18:00" size="small" type="time" fullWidth />
          <TextField label="Time Zone" defaultValue="Africa/Casablanca" size="small" fullWidth />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Save Changes</Button>
        </Box>
      </SettingSection>

      {/* Security */}
      <SettingSection title="Security Settings" desc="Authentication and access control configuration">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <TextField label="Session Timeout (minutes)" defaultValue="60" size="small" type="number" fullWidth />
          <TextField label="Max Login Attempts" defaultValue="5" size="small" type="number" fullWidth />
          <TextField label="Password Min Length" defaultValue="8" size="small" type="number" fullWidth />
          <TextField label="JWT Token Expiry" defaultValue="7d" size="small" fullWidth />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Save Changes</Button>
        </Box>
      </SettingSection>
    </AdminLayout>
  );
}

export default SystemSettingsPage;
