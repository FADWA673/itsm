import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";

const ROLES = [
  {
    name: "SUPER_ADMIN", color: "#7C3AED", users: 1,
    permissions: ["Manage Users", "Manage Roles", "Configure System", "View Audit Logs", "Manage Tickets", "Configure SLA"],
  },
  {
    name: "ADMIN", color: "#2563EB", users: 1,
    permissions: ["Manage Users", "Manage Ticket Categories", "View Reports", "Configure Notifications"],
  },
  {
    name: "MANAGER", color: "#059669", users: 1,
    permissions: ["View Team Tickets", "View Reports", "Track SLA Compliance", "Manage Technicians"],
  },
  {
    name: "TECHNICIAN", color: "#D97706", users: 1,
    permissions: ["View Assigned Tickets", "Update Ticket Status", "Add Internal Notes", "Resolve Incidents"],
  },
  {
    name: "USER", color: "#6B7280", users: 2,
    permissions: ["Create Tickets", "Track My Tickets", "Search Knowledge Base", "Rate Resolved Tickets"],
  },
];

function RolesPermissionsPage() {
  return (
    <AdminLayout title="Roles & Permissions">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>Roles & Permissions</Typography>
        <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>Define what each role can access and do on the platform</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {ROLES.map((role) => (
          <Paper key={role.name} elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: role.color }} />
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: ADMIN_COLORS.textPrimary }}>{role.name.replace("_", " ")}</Typography>
              </Box>
              <Chip label={`${role.users} user${role.users > 1 ? "s" : ""}`} size="small" sx={{ bgcolor: `${role.color}15`, color: role.color, fontWeight: 600 }} />
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
              {role.permissions.map((perm) => (
                <Chip key={perm} label={perm} size="small" sx={{ bgcolor: "#F1F5F9", color: ADMIN_COLORS.textSecondary, fontSize: 11 }} />
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </AdminLayout>
  );
}

export default RolesPermissionsPage;
