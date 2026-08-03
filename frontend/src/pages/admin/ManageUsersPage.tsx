import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";
import { getUsers, createUser, type UserDTO, type CreateUserDTO } from "../../services/users.service";
import { useNotificationStore } from "../../store";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#7C3AED",
  ADMIN: "#2563EB",
  MANAGER: "#059669",
  TECHNICIAN: "#D97706",
  USER: "#6B7280",
};

const ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "TECHNICIAN", "USER"];

function ManageUsersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const { addNotification } = useNotificationStore();

  const [form, setForm] = useState<CreateUserDTO>({
    email: "", password: "", firstName: "", lastName: "", role: "USER",
  });

  // Charger les utilisateurs depuis la DB au montage
  useEffect(() => {
    let cancelled = false;
    getUsers()
      .then((data) => { if (!cancelled) { setUsers(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { addNotification("Failed to load users", "error"); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateUser = async () => {
    setFormError("");
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setFormError("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await createUser(form);
      setUsers((prev) => [newUser, ...prev]);
      setModalOpen(false);
      addNotification(`User ${newUser.email} created successfully`, "success");
    } catch (err) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to create user";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days ago`;
  };

  return (
    <AdminLayout title="Manage Users">
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>User Management</Typography>
          <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
            {users.length} users — Create, edit and manage platform accounts
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalOpen(true)} sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>
          Add User
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}` }}>
        <TextField fullWidth size="small" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: ADMIN_COLORS.textSecondary, fontSize: 20 }} /></InputAdornment> } }} />
      </Paper>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, overflow: "hidden" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr", px: 3, py: 1.5, bgcolor: "#F8FAFC", borderBottom: `1px solid ${ADMIN_COLORS.border}` }}>
            {["User", "Email", "Role", "Status", "Last Login"].map((h) => (
              <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: ADMIN_COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
            ))}
          </Box>
          {filtered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}><Typography sx={{ color: ADMIN_COLORS.textSecondary }}>No users found</Typography></Box>
          ) : filtered.map((user, i) => (
            <Box key={user.id} sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr", px: 3, py: 2, borderBottom: i < filtered.length - 1 ? `1px solid ${ADMIN_COLORS.border}` : "none", alignItems: "center", "&:hover": { bgcolor: "#F8FAFC" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: ROLE_COLORS[user.role] || "#6B7280", fontSize: 13 }}>
                  {`${user.firstName[0]}${user.lastName[0]}`.toUpperCase()}
                </Avatar>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textPrimary }}>{user.firstName} {user.lastName}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13, color: ADMIN_COLORS.textSecondary }}>{user.email}</Typography>
              <Chip label={user.role.replace("_", " ")} size="small" sx={{ bgcolor: `${ROLE_COLORS[user.role]}15`, color: ROLE_COLORS[user.role], fontWeight: 600, fontSize: 11 }} />
              <Chip label={user.status} size="small" sx={{ bgcolor: user.status === "ACTIVE" ? "#ECFDF5" : "#FEF2F2", color: user.status === "ACTIVE" ? "#059669" : "#DC2626", fontWeight: 600, fontSize: 11 }} />
              <Typography sx={{ fontSize: 13, color: ADMIN_COLORS.textSecondary }}>{formatDate(user.lastLoginAt)}</Typography>
            </Box>
          ))}
        </Paper>
      )}

      {/* ── Modal Add User ─────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onClose={() => { setModalOpen(false); setFormError(""); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, pb: 1 }}>Add New User</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} size="small" fullWidth required />
              <TextField label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} size="small" fullWidth required />
            </Box>
            <TextField label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} size="small" fullWidth required />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} size="small" fullWidth required helperText="Minimum 8 characters" />
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ROLE_COLORS[r] }} />
                      {r.replace("_", " ")}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setModalOpen(false); setFormError(""); }} sx={{ textTransform: "none", color: ADMIN_COLORS.textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser} disabled={submitting} sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>
            {submitting ? "Creating..." : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default ManageUsersPage;
