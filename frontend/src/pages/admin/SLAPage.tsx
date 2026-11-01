import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";
import { slaService, type SLAConfig } from "../../services/sla.service";

const PRIORITY_CONFIG = {
  CRITICAL: { icon: "🔴", color: "#DC2626" },
  HIGH: { icon: "🟠", color: "#D97706" },
  MEDIUM: { icon: "🟡", color: "#F59E0B" },
  LOW: { icon: "🟢", color: "#059669" },
};

function SLAPage() {
  const [configs, setConfigs] = useState<SLAConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    config: SLAConfig | null;
  }>({ open: false, config: null });
  const [formData, setFormData] = useState({
    responseTime: 0,
    resolveTime: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setError(null);
      const data = await slaService.getAllConfigs();
      setConfigs(data);
    } catch (err: any) {
      console.error("Failed to load SLA configs:", err);
      setError(err.response?.data?.message || "Failed to load SLA configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (config: SLAConfig) => {
    setFormData({
      responseTime: config.responseTime,
      resolveTime: config.resolveTime,
    });
    setEditDialog({ open: true, config });
  };

  const handleCloseEdit = () => {
    setEditDialog({ open: false, config: null });
    setFormData({ responseTime: 0, resolveTime: 0 });
  };

  const handleSave = async () => {
    if (!editDialog.config) return;

    if (formData.responseTime <= 0 || formData.resolveTime <= 0) {
      alert("Response time and resolution time must be greater than 0");
      return;
    }

    if (formData.responseTime >= formData.resolveTime) {
      alert("Response time must be less than resolution time");
      return;
    }

    try {
      setSaving(true);
      await slaService.updateConfig(
        editDialog.config.priority,
        formData.responseTime,
        formData.resolveTime
      );
      alert("SLA configuration updated successfully");
      handleCloseEdit();
      loadConfigs();
    } catch (err: any) {
      console.error("Failed to update SLA config:", err);
      alert(err.response?.data?.message || "Failed to update SLA configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="SLA Configuration">
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="SLA Configuration">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>
          ⏱️ SLA Configuration
        </Typography>
        <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
          SLA (Service Level Agreement) — defines maximum response and resolution times for each priority level
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Info Card */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: "#EFF6FF", border: "1px solid #DBEAFE" }}>
        <Typography variant="body2" sx={{ color: "#1E40AF", mb: 1 }}>
          <strong>Working Hours:</strong> Monday - Friday, 08:30 - 17:30
        </Typography>
        <Typography variant="body2" sx={{ color: "#1E40AF" }}>
          SLA timer pauses when ticket status is <strong>WAITING_FOR_USER</strong> and outside working hours
        </Typography>
      </Paper>

      {/* SLA Policies */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, mb: 2 }}>
        SLA Policies by Priority
      </Typography>
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, overflow: "hidden", mb: 3 }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 0.5fr",
            px: 3,
            py: 1.5,
            bgcolor: "#F8FAFC",
            borderBottom: `1px solid ${ADMIN_COLORS.border}`,
          }}
        >
          {["Priority", "First Response", "Resolution Time", "Actions"].map((h) => (
            <Typography
              key={h}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: ADMIN_COLORS.textSecondary,
                textTransform: "uppercase",
              }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        {configs.map((config, i) => {
          const priorityInfo = PRIORITY_CONFIG[config.priority as keyof typeof PRIORITY_CONFIG];
          return (
            <Box
              key={config.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 0.5fr",
                px: 3,
                py: 2,
                borderBottom: i < configs.length - 1 ? `1px solid ${ADMIN_COLORS.border}` : "none",
                alignItems: "center",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              {/* Priority */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography>{priorityInfo?.icon || "⚪"}</Typography>
                <Chip
                  label={config.priority}
                  size="small"
                  sx={{
                    bgcolor: `${priorityInfo?.color || "#6B7280"}15`,
                    color: priorityInfo?.color || "#6B7280",
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Response Time */}
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textPrimary }}>
                {slaService.formatMinutes(config.responseTime)}
              </Typography>

              {/* Resolution Time */}
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textPrimary }}>
                {slaService.formatMinutes(config.resolveTime)}
              </Typography>

              {/* Actions */}
              <Box>
                <IconButton size="small" onClick={() => handleOpenEdit(config)} title="Edit">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Paper>

      {/* Legend */}
      <Paper sx={{ p: 2.5, bgcolor: "#F8FAFC", border: `1px solid ${ADMIN_COLORS.border}` }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          SLA Status Indicators:
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>🟢</Typography>
            <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary }}>
              OK (&gt; 25% time remaining)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>🟠</Typography>
            <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary }}>
              At Risk (10-25% time remaining)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>🔴</Typography>
            <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary }}>
              Breached (exceeded deadline)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography>⏸️</Typography>
            <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary }}>
              Paused (waiting for user)
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>
          ✏️ Edit SLA Configuration - {editDialog.config?.priority}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>
            <TextField
              fullWidth
              label="First Response Time (minutes)"
              type="number"
              value={formData.responseTime}
              onChange={(e) =>
                setFormData({ ...formData, responseTime: parseInt(e.target.value) || 0 })
              }
              helperText="Maximum time to first response from a technician"
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              label="Resolution Time (minutes)"
              type="number"
              value={formData.resolveTime}
              onChange={(e) =>
                setFormData({ ...formData, resolveTime: parseInt(e.target.value) || 0 })
              }
              helperText="Maximum time to completely resolve the ticket"
              InputProps={{ inputProps: { min: 1 } }}
            />

            {/* Preview */}
            <Paper sx={{ p: 2, bgcolor: "#F8FAFC" }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                Preview:
              </Typography>
              <Typography variant="body2">
                Response: <strong>{slaService.formatMinutes(formData.responseTime || 0)}</strong>
              </Typography>
              <Typography variant="body2">
                Resolution: <strong>{slaService.formatMinutes(formData.resolveTime || 0)}</strong>
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default SLAPage;
