import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useAuthStore, useNotificationStore } from "../../store";
import { createTicketApi } from "../../services/tickets.service";

const CATEGORIES = ["Software", "Hardware", "Network", "Access Request", "Email & Communication", "Printer & Peripherals", "Security", "General IT Support"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const IMPACTS = ["Individual", "Department", "Multiple Departments", "Entire Organization"];

function CreateTicketPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();
  void user;
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "", subject: "", description: "", priority: "", impact: "" });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.category || !form.subject || !form.description || !form.priority || !form.impact) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await createTicketApi({
        category: form.category,
        subject: form.subject,
        description: form.description,
        priority: form.priority.toUpperCase(),
        impact: form.impact.toUpperCase().replace(/ /g, "_"),
      });
      addNotification("Ticket submitted successfully!", "success");
      navigate("/employee/tickets");
    } catch (err) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to submit ticket";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EmployeeLayout>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>Create New Ticket</Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>Describe your issue and submit a request to the IT Support team.</Typography>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Ticket Information</Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Category + Subject */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel>Category *</InputLabel>
              <Select label="Category *" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Subject *" size="small" fullWidth placeholder="Enter ticket subject..." value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </Box>

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Description *"
              multiline
              rows={5}
              fullWidth
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </Box>

          {/* Priority + Impact */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, mb: 3 }}>
            <FormControl size="small" fullWidth required>
              <InputLabel>Priority *</InputLabel>
              <Select label="Priority *" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth required>
              <InputLabel>Impact *</InputLabel>
              <Select label="Impact *" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })}>
                {IMPACTS.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          {/* Attachments */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#374151", mb: 1 }}>Attachments</Typography>
            <Box
              sx={{
                border: "2px dashed #D1D5DB",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                cursor: "pointer",
                "&:hover": { borderColor: "#2563EB", bgcolor: "#EFF6FF" },
                transition: "all 0.2s",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: "#6B7280", mb: 1 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Upload Files</Typography>
              <Typography sx={{ fontSize: 12, color: "#9CA3AF", mt: 0.5 }}>Drag & drop files here or click to browse</Typography>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.5 }}>Supported formats: PDF, JPG, PNG, DOCX. Maximum file size: 25 MB</Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate("/employee/tickets")} sx={{ textTransform: "none", borderColor: "#D1D5DB", color: "#374151", "&:hover": { borderColor: "#9CA3AF" } }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={submitting} sx={{ bgcolor: "#2563EB", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { bgcolor: "#1D4ED8" } }}>
              {submitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </EmployeeLayout>
  );
}

export default CreateTicketPage;
