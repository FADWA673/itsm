import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import EmployeeLayout from "../../layouts/EmployeeLayout";

const ALL_TICKETS = [
  { id: "INC-2026-000001", subject: "Cannot login to ERP", category: "Software", priority: "High", status: "In Progress", created: "15 Jul", updated: "Today" },
  { id: "INC-2026-000002", subject: "Printer not responding", category: "Hardware", priority: "Medium", status: "Open", created: "14 Jul", updated: "Yesterday" },
  { id: "INC-2026-000003", subject: "VPN connection failed", category: "Network", priority: "High", status: "Waiting for User", created: "13 Jul", updated: "2 days ago" },
  { id: "INC-2026-000004", subject: "Outlook keeps crashing", category: "Software", priority: "Low", status: "Resolved", created: "10 Jul", updated: "10 Jul" },
  { id: "INC-2026-000005", subject: "New employee account request", category: "Access Request", priority: "Medium", status: "Closed", created: "08 Jul", updated: "09 Jul" },
  { id: "INC-2026-000006", subject: "Monitor display issues", category: "Hardware", priority: "Low", status: "Open", created: "07 Jul", updated: "07 Jul" },
  { id: "INC-2026-000007", subject: "Cannot access shared drive", category: "Network", priority: "High", status: "In Progress", created: "05 Jul", updated: "06 Jul" },
  { id: "INC-2026-000008", subject: "Teams call quality poor", category: "Software", priority: "Medium", status: "Resolved", created: "03 Jul", updated: "04 Jul" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "In Progress": { bg: "#FEF3C7", text: "#D97706" },
  "Open": { bg: "#EFF6FF", text: "#2563EB" },
  "Waiting for User": { bg: "#F3E8FF", text: "#7C3AED" },
  "Resolved": { bg: "#ECFDF5", text: "#059669" },
  "Closed": { bg: "#F3F4F6", text: "#6B7280" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FEF2F2", text: "#DC2626" },
  Medium: { bg: "#FFFBEB", text: "#D97706" },
  Low: { bg: "#ECFDF5", text: "#059669" },
};

const PAGE_SIZE = 5;

function MyTicketsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = ALL_TICKETS.filter((t) => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <EmployeeLayout>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>My Tickets</Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>View, search, and track the status of all your support requests.</Typography>
      </Paper>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
        <TextField size="small" placeholder="Search tickets..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} sx={{ flex: 1 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment> } }} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} displayEmpty>
            <MenuItem value="All">Status</MenuItem>
            {["Open", "In Progress", "Waiting for User", "Resolved", "Closed"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} displayEmpty>
            <MenuItem value="All">Priority</MenuItem>
            {["High", "Medium", "Low"].map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/employee/create-ticket")} sx={{ bgcolor: "#2563EB", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>
          New Ticket
        </Button>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>My Tickets</Typography>
          <Typography sx={{ fontSize: 13, color: "#6B7280" }}>{filtered.length} Tickets</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr", px: 3, py: 1.5, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
          {["Ticket ID", "Subject", "Category", "Priority", "Status", "Created", "Updated", "Actions"].map((h) => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>{h}</Typography>
          ))}
        </Box>

        {paginated.map((ticket, i) => (
          <Box key={ticket.id} sx={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr", px: 3, py: 1.5, borderBottom: i < paginated.length - 1 ? "1px solid #F3F4F6" : "none", alignItems: "center", "&:hover": { bgcolor: "#F9FAFB" } }}>
            <Typography sx={{ fontSize: 12, fontFamily: "monospace", color: "#374151" }}>{ticket.id}</Typography>
            <Typography sx={{ fontSize: 13, color: "#111827" }}>{ticket.subject}</Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{ticket.category}</Typography>
            <Chip label={ticket.priority} size="small" sx={{ bgcolor: PRIORITY_COLORS[ticket.priority]?.bg, color: PRIORITY_COLORS[ticket.priority]?.text, fontWeight: 600, fontSize: 11, height: 22 }} />
            <Chip label={ticket.status} size="small" sx={{ bgcolor: STATUS_COLORS[ticket.status]?.bg, color: STATUS_COLORS[ticket.status]?.text, fontWeight: 600, fontSize: 11, height: 22 }} />
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{ticket.created}</Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{ticket.updated}</Typography>
            <Typography sx={{ fontSize: 12, color: "#2563EB", cursor: "pointer", fontWeight: 600 }}>View</Typography>
          </Box>
        ))}

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} tickets
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" disabled={page === 1} onClick={() => setPage(page - 1)} sx={{ textTransform: "none", color: "#374151", border: "1px solid #E5E7EB" }}>Previous</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button key={p} size="small" onClick={() => setPage(p)} sx={{ textTransform: "none", minWidth: 36, bgcolor: p === page ? "#2563EB" : "transparent", color: p === page ? "white" : "#374151", border: "1px solid #E5E7EB", "&:hover": { bgcolor: p === page ? "#1D4ED8" : "#F9FAFB" } }}>{p}</Button>
            ))}
            <Button size="small" disabled={page === totalPages} onClick={() => setPage(page + 1)} sx={{ textTransform: "none", color: "#374151", border: "1px solid #E5E7EB" }}>Next</Button>
          </Box>
        </Box>
      </Paper>
    </EmployeeLayout>
  );
}

export default MyTicketsPage;
