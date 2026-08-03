import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";

const MOCK_USERS = [
  { id: 1, name: "Admin ITSM", email: "fadwazr12@gmail.com", role: "SUPER_ADMIN", status: "ACTIVE", lastLogin: "Today" },
  { id: 2, name: "Ahmed Employé", email: "employee@gmail.com", role: "USER", status: "ACTIVE", lastLogin: "Today" },
  { id: 3, name: "Sara Technicien", email: "tech@gmail.com", role: "TECHNICIAN", status: "ACTIVE", lastLogin: "Yesterday" },
  { id: 4, name: "Karim IT Manager", email: "manager@gmail.com", role: "MANAGER", status: "ACTIVE", lastLogin: "Today" },
  { id: 5, name: "Fatima Dept Manager", email: "dept@gmail.com", role: "ADMIN", status: "ACTIVE", lastLogin: "2 days ago" },
];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "#7C3AED",
  ADMIN: "#2563EB",
  MANAGER: "#059669",
  TECHNICIAN: "#D97706",
  USER: "#6B7280",
};

function ManageUsersPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Manage Users">
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>
            Create, edit and manage platform accounts
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>
          Add User
        </Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}` }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: ADMIN_COLORS.textSecondary, fontSize: 20 }} /></InputAdornment> } }}
        />
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, overflow: "hidden" }}>
        {/* Table Header */}
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr", px: 3, py: 1.5, bgcolor: "#F8FAFC", borderBottom: `1px solid ${ADMIN_COLORS.border}` }}>
          {["User", "Email", "Role", "Status", "Last Login"].map((h) => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: ADMIN_COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</Typography>
          ))}
        </Box>

        {/* Rows */}
        {filtered.map((user, i) => (
          <Box key={user.id} sx={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr", px: 3, py: 2, borderBottom: i < filtered.length - 1 ? `1px solid ${ADMIN_COLORS.border}` : "none", alignItems: "center", "&:hover": { bgcolor: "#F8FAFC" } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: ROLE_COLORS[user.role] || "#6B7280", fontSize: 13 }}>
                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </Avatar>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: ADMIN_COLORS.textPrimary }}>{user.name}</Typography>
            </Box>
            <Typography sx={{ fontSize: 13, color: ADMIN_COLORS.textSecondary }}>{user.email}</Typography>
            <Chip label={user.role.replace("_", " ")} size="small" sx={{ bgcolor: `${ROLE_COLORS[user.role]}15`, color: ROLE_COLORS[user.role], fontWeight: 600, fontSize: 11 }} />
            <Chip label={user.status} size="small" sx={{ bgcolor: "#ECFDF5", color: "#059669", fontWeight: 600, fontSize: 11 }} />
            <Typography sx={{ fontSize: 13, color: ADMIN_COLORS.textSecondary }}>{user.lastLogin}</Typography>
          </Box>
        ))}
      </Paper>
    </AdminLayout>
  );
}

export default ManageUsersPage;
