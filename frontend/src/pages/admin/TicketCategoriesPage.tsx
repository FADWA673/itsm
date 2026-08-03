import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import AddIcon from "@mui/icons-material/Add";
import AdminLayout from "../../layouts/AdminLayout";
import { ADMIN_COLORS } from "../../styles/adminTheme";

const CATEGORIES = [
  { id: 1, name: "Network Issues", icon: "🌐", tickets: 12, priority: "High", color: "#DC2626" },
  { id: 2, name: "Hardware", icon: "💻", tickets: 8, priority: "Medium", color: "#D97706" },
  { id: 3, name: "Software & Applications", icon: "⚙️", tickets: 25, priority: "Medium", color: "#D97706" },
  { id: 4, name: "Email & Communication", icon: "📧", tickets: 6, priority: "Low", color: "#059669" },
  { id: 5, name: "Printer & Peripherals", icon: "🖨️", tickets: 4, priority: "Low", color: "#059669" },
  { id: 6, name: "Security & Access", icon: "🔒", tickets: 3, priority: "High", color: "#DC2626" },
  { id: 7, name: "Data & Backup", icon: "💾", tickets: 2, priority: "High", color: "#DC2626" },
  { id: 8, name: "General IT Support", icon: "🛠️", tickets: 15, priority: "Low", color: "#059669" },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FEF2F2", text: "#DC2626" },
  Medium: { bg: "#FFFBEB", text: "#D97706" },
  Low: { bg: "#ECFDF5", text: "#059669" },
};

function TicketCategoriesPage() {
  const [categories] = useState(CATEGORIES);

  return (
    <AdminLayout title="Ticket Categories">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>Ticket Categories</Typography>
          <Typography variant="body2" sx={{ color: ADMIN_COLORS.textSecondary, mt: 0.5 }}>Organize tickets by type and priority</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ bgcolor: ADMIN_COLORS.primary, borderRadius: 2, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>
          Add Category
        </Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
        {categories.map((cat) => (
          <Paper key={cat.id} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${ADMIN_COLORS.border}`, bgcolor: ADMIN_COLORS.cardBg, cursor: "pointer", transition: "all 0.2s", "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" } }}>
            <Typography sx={{ fontSize: 28, mb: 1 }}>{cat.icon}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: ADMIN_COLORS.textPrimary, mb: 0.5 }}>{cat.name}</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5 }}>
              <Typography sx={{ fontSize: 12, color: ADMIN_COLORS.textSecondary }}>{cat.tickets} tickets</Typography>
              <Chip label={cat.priority} size="small" sx={{ bgcolor: PRIORITY_COLORS[cat.priority].bg, color: PRIORITY_COLORS[cat.priority].text, fontWeight: 600, fontSize: 10 }} />
            </Box>
          </Paper>
        ))}
      </Box>
    </AdminLayout>
  );
}

export default TicketCategoriesPage;
