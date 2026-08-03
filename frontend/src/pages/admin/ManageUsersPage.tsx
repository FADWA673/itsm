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
import DialogContentText from "@mui/material/DialogContentText";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import LockResetIcon from "@mui/icons-material/LockReset";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";
import { getUsers, createUser, updateUser, resetUserPassword, deleteUser, deactivateUser, type UserDTO, type CreateUserDTO } from "../../services/users.service";
import { useNotificationStore } from "../../store";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#7C3AED",
  ADMIN: "#2563EB",
  MANAGER: "#059669",
  TECHNICIAN: "#D97706",
  USER: "#6B7280",
};
const ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "TECHNICIAN", "USER"];
const STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"];
const GRID = "2fr 2fr 1.5fr 1fr 1fr 1fr";

function formatDate(d: string | null): string {
  if (!d) return "Never";
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

interface EditForm { firstName: string; lastName: string; role: string; status: string; }

function ManageUsersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addNotification } = useNotificationStore();

  // Add User
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [addForm, setAddForm] = useState<CreateUserDTO>({ email: "", password: "", firstName: "", lastName: "", role: "USER" });

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<UserDTO | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ firstName: "", lastName: "", role: "USER", status: "ACTIVE" });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // Deactivate
  const [deactivateTarget, setDeactivateTarget] = useState<UserDTO | null>(null);
  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);

  // Reset Password
  const [resetTarget, setResetTarget] = useState<UserDTO | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<UserDTO | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getUsers()
      .then((data) => { if (!cancelled) { setUsers(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { addNotification("Failed to load users", "error"); setLoading(false); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add User handler
  const handleCreateUser = async () => {
    setAddError("");
    if (!addForm.email || !addForm.password || !addForm.firstName || !addForm.lastName) { setAddError("All fields are required"); return; }
    if (addForm.password.length < 8) { setAddError("Password must be at least 8 characters"); return; }
    setAddSubmitting(true);
    try {
      const newUser = await createUser(addForm);
      setUsers((prev) => [newUser, ...prev]);
      setAddOpen(false);
      addNotification(`User ${newUser.email} created successfully`, "success");
    } catch (err) {
      setAddError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to create user");
    } finally { setAddSubmitting(false); }
  };

  // Edit handler
  const handleOpenEdit = (user: UserDTO) => {
    setEditTarget(user);
    setEditForm({ firstName: user.firstName, lastName: user.lastName, role: user.role, status: user.status });
    setEditError("");
    setEditOpen(true);
  };
  const handleEditSubmit = async () => {
    if (!editTarget) return;
    setEditError("");
    if (!editForm.firstName || !editForm.lastName) { setEditError("First name and last name are required"); return; }
    setEditSubmitting(true);
    try {
      const updated = await updateUser(editTarget.id, { firstName: editForm.firstName, lastName: editForm.lastName, role: editForm.role });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditOpen(false);
      addNotification(`User ${updated.email} updated`, "success");
    } catch (err) {
      setEditError(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to update user");
    } finally { setEditSubmitting(false); }
  };

  // Deactivate handler
  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    setDeactivateSubmitting(true);
    try {
      const updated = await deactivateUser(deactivateTarget.id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      addNotification(`User ${updated.email} deactivated`, "success");
    } catch { addNotification("Failed to deactivate user", "error"); }
    finally { setDeactivateSubmitting(false); setDeactivateTarget(null); }
  };

  // Reset Password handler
  const handleResetPassword = async () => {
    if (!resetTarget || newResetPassword.length < 8) return;
    setResetSubmitting(true);
    try {
      await resetUserPassword(resetTarget.id, newResetPassword);
      addNotification("Password reset successfully", "success");
      setResetTarget(null);
      setNewResetPassword("");
    } catch (err) {
      addNotification(err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to reset password", "error");
    } finally { setResetSubmitting(false); }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      addNotification(`User ${deleteTarget.email} deleted`, "success");
    } catch { addNotification("Failed to delete user", "error"); }
    finally { setDeleteSubmitting(false); setDeleteTarget(null); }
  };

  const filtered = users.filter((u) =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Manage Users">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>User Management</Typography>
          <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>{users.length} users — Create, edit and manage accounts</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setAddForm({ email: "", password: "", firstName: "", lastName: "", role: "USER" }); setAddError(""); setAddOpen(true); }}
          sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>Add User</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}` }}>
        <TextField fullWidth size="small" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: ADMIN_COLORS.textSecondary, fontSize: 20 }} /></InputAdornment> } }} />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, overflow: "hidden" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: GRID, px: 3, py: 1.5, bgcolor: "#F8FAFC", borderBottom: `1px solid ${ADMIN_COLORS.border}` }}>
            {["User", "Email", "Role", "Status", "Last Login", "Actions"].map((h) => (
              <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: ADMIN_COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
            ))}
          </Box>
          {filtered.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}><Typography sx={{ color: ADMIN_COLORS.textSecondary }}>No users found</Typography></Box>
          ) : filtered.map((user, i) => (
            <Box key={user.id} sx={{ display: "grid", gridTemplateColumns: GRID, px: 3, py: 1.5, borderBottom: i < filtered.length - 1 ? `1px solid ${ADMIN_COLORS.border}` : "none", alignItems: "center", "&:hover": { bgcolor: "#F8FAFC" } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: ROLE_COLORS[user.role] || "#6B7280", fontSize: 13 }}>{`${user.firstName[0]}${user.lastName[0]}`.toUpperCase()}</Avatar>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textPrimary }}>{user.firstName} {user.lastName}</Typography>
              </Box>
              <Typography sx={{ fontSize: 13, color: ADMIN_COLORS.textSecondary }}>{user.email}</Typography>
              <Chip label={user.role.replace("_", " ")} size="small" sx={{ bgcolor: `${ROLE_COLORS[user.role]}15`, color: ROLE_COLORS[user.role], fontWeight: 600, fontSize: 11, width: "fit-content" }} />
              <Chip label={user.status} size="small" sx={{ bgcolor: user.status === "ACTIVE" ? "#ECFDF5" : "#FEF2F2", color: user.status === "ACTIVE" ? "#059669" : "#DC2626", fontWeight: 600, fontSize: 11, width: "fit-content" }} />
              <Typography sx={{ fontSize: 13, color: ADMIN_COLORS.textSecondary }}>{formatDate(user.lastLoginAt)}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenEdit(user)} sx={{ color: "#2563EB", "&:hover": { bgcolor: "rgba(37,99,235,0.08)" } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Deactivate"><IconButton size="small" onClick={() => setDeactivateTarget(user)} sx={{ color: "#EA580C", "&:hover": { bgcolor: "rgba(234,88,12,0.08)" } }}><BlockIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Reset Password"><IconButton size="small" onClick={() => { setResetTarget(user); setNewResetPassword(""); }} sx={{ color: "#7C3AED", "&:hover": { bgcolor: "rgba(124,58,237,0.08)" } }}><LockResetIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteTarget(user)} sx={{ color: "#DC2626", "&:hover": { bgcolor: "rgba(220,38,38,0.08)" } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      {/* Add User Dialog */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setAddError(""); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, pb: 1 }}>Add New User</DialogTitle>
        <DialogContent>
          {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField label="First Name" value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} size="small" fullWidth required />
              <TextField label="Last Name" value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} size="small" fullWidth required />
            </Box>
            <TextField label="Email Address" type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} size="small" fullWidth required />
            <TextField label="Password" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} size="small" fullWidth required helperText="Minimum 8 characters" />
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}>
                {ROLES.map((r) => (<MenuItem key={r} value={r}><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ROLE_COLORS[r] }} />{r.replace("_", " ")}</Box></MenuItem>))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setAddOpen(false); setAddError(""); }} sx={{ textTransform: "none", color: ADMIN_COLORS.textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateUser} disabled={addSubmitting} sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>{addSubmitting ? "Creating..." : "Create User"}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditError(""); }} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, pb: 1 }}>Edit User</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField label="First Name" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} size="small" fullWidth required />
              <TextField label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} size="small" fullWidth required />
            </Box>
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                {ROLES.map((r) => (<MenuItem key={r} value={r}><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ROLE_COLORS[r] }} />{r.replace("_", " ")}</Box></MenuItem>))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                {STATUSES.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setEditOpen(false); setEditError(""); }} sx={{ textTransform: "none", color: ADMIN_COLORS.textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit} disabled={editSubmitting} sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>{editSubmitting ? "Saving..." : "Save Changes"}</Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={Boolean(deactivateTarget)} onClose={() => !deactivateSubmitting && setDeactivateTarget(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>Deactivate User</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to deactivate <strong>{deactivateTarget?.firstName} {deactivateTarget?.lastName}</strong>? They will no longer be able to log in.</DialogContentText></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeactivateTarget(null)} disabled={deactivateSubmitting} sx={{ textTransform: "none", color: ADMIN_COLORS.textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeactivateConfirm} disabled={deactivateSubmitting} sx={{ bgcolor: "#EA580C", borderRadius: 2, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#C2410C" } }}>{deactivateSubmitting ? "Deactivating..." : "Deactivate"}</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={Boolean(resetTarget)} onClose={() => { setResetTarget(null); setNewResetPassword(""); }} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary, pb: 1 }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mb: 2 }}>Set a new password for <strong>{resetTarget?.firstName} {resetTarget?.lastName}</strong></Typography>
          <TextField label="New Password" type="password" fullWidth size="small" value={newResetPassword} onChange={(e) => setNewResetPassword(e.target.value)} helperText="Minimum 8 characters" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { setResetTarget(null); setNewResetPassword(""); }} sx={{ textTransform: "none", color: ADMIN_COLORS.textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={resetSubmitting || newResetPassword.length < 8} sx={{ bgcolor: "#7C3AED", borderRadius: 2, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#6D28D9" } }}>{resetSubmitting ? "Resetting..." : "Reset Password"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => !deleteSubmitting && setDeleteTarget(null)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#DC2626" }}>Delete User</DialogTitle>
        <DialogContent><DialogContentText>Are you sure you want to delete <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? This action cannot be undone.</DialogContentText></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteSubmitting} sx={{ textTransform: "none", color: ADMIN_COLORS.textSecondary }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteConfirm} disabled={deleteSubmitting} sx={{ bgcolor: "#DC2626", borderRadius: 2, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#B91C1C" } }}>{deleteSubmitting ? "Deleting..." : "Delete"}</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default ManageUsersPage;
