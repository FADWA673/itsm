import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WebIcon from "@mui/icons-material/Web";
import AdminLayout from "../../layouts/AdminLayout";
import SLAIndicator from "../../components/SLAIndicator";
import {
  getAllTicketsApi,
  assignTicketApi,
  deleteTicketApi,
  type TicketDTO,
} from "../../services/tickets.service";
import { getUsers, type UserDTO } from "../../services/users.service";
import { useNotificationStore } from "../../store";
import { getAdminColors } from "../../styles/adminTheme";
import { useThemeStore } from "../../store";
import { PATHS, buildPath } from "../../routes/paths";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#EFF6FF", text: "#2563EB" },
  IN_PROGRESS: { bg: "#FEF3C7", text: "#D97706" },
  WAITING_FOR_USER: { bg: "#F3E8FF", text: "#7C3AED" },
  RESOLVED: { bg: "#ECFDF5", text: "#059669" },
  CLOSED: { bg: "#F3F4F6", text: "#6B7280" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  LOW: { bg: "#ECFDF5", text: "#059669" },
  MEDIUM: { bg: "#FFFBEB", text: "#D97706" },
  HIGH: { bg: "#FEF2F2", text: "#DC2626" },
  CRITICAL: { bg: "#FDF2F8", text: "#9D174D" },
};

const PAGE_SIZE = 10;

function AdminTicketsPage() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const C = getAdminColors(mode);
  const { addNotification } = useNotificationStore();

  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [technicians, setTechnicians] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Assign dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDTO | null>(null);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsData, usersData] = await Promise.all([
        getAllTicketsApi(),
        getUsers(),
      ]);
      setTickets(ticketsData);
      setTechnicians(usersData.filter((u) => u.role === "TECHNICIAN" && u.status === "ACTIVE"));
    } catch {
      addNotification("Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = t.subject.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q) || t.createdByName.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAssign = (ticket: TicketDTO) => {
    setSelectedTicket(ticket);
    setSelectedTechId(ticket.assignedToId ?? "");
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedTicket || !selectedTechId) return;
    setAssigning(true);
    try {
      const updated = await assignTicketApi(selectedTicket.id, selectedTechId);
      setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      addNotification(`Ticket assigned to ${updated.assignedToName}`, "success");
      setAssignDialogOpen(false);
    } catch {
      addNotification("Failed to assign ticket", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async (ticket: TicketDTO) => {
    if (!confirm(`Are you sure you want to delete ticket ${ticket.ticketNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteTicketApi(ticket.id);
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      addNotification(`Ticket ${ticket.ticketNumber} deleted successfully`, "success");
    } catch (error: any) {
      addNotification(error.response?.data?.message || "Failed to delete ticket", "error");
    }
  };

  // Stats
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  return (
    <AdminLayout title="All Tickets">
      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
        {[
          { label: "Total", value: stats.total, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Open", value: stats.open, color: "#F59E0B", bg: "#FFFBEB" },
          { label: "In Progress", value: stats.inProgress, color: "#D97706", bg: "#FEF3C7" },
          { label: "Resolved", value: stats.resolved, color: "#059669", bg: "#ECFDF5" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.cardBg, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: s.color }}>{loading ? "—" : s.value}</Typography>
            </Box>
            <Typography sx={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>{s.label} Tickets</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small" placeholder="Search tickets, users…" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          sx={{ flex: 1, minWidth: 200 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#9CA3AF" }} /></InputAdornment> } }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} displayEmpty>
            <MenuItem value="All">All Statuses</MenuItem>
            {["OPEN", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED"].map((s) => (
              <MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} displayEmpty>
            <MenuItem value="All">All Priorities</MenuItem>
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Tooltip title="Refresh">
          <Button onClick={loadData} variant="outlined" size="small" sx={{ borderColor: C.border, color: C.textSecondary, minWidth: 40, px: 1 }}>
            <RefreshIcon fontSize="small" />
          </Button>
        </Tooltip>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${C.border}`, bgcolor: C.cardBg, overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderBottom: `1px solid ${C.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary }}>Tickets</Typography>
          <Typography sx={{ fontSize: 13, color: C.textSecondary }}>{filtered.length} tickets</Typography>
        </Box>

        {/* Header */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 2.2fr 0.9fr 1fr 0.9fr 1.1fr 1.2fr 1fr", px: 3, py: 1.5, bgcolor: mode === "dark" ? "#1a1d2b" : "#F8FAFC", borderBottom: `1px solid ${C.border}` }}>
          {["Ticket ID", "Subject", "Priority", "Status", "SLA", "Assigned To", "Created By", "Actions"].map((h) => (
            <Typography key={h} sx={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, textTransform: "uppercase" }}>{h}</Typography>
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: C.primary }} />
          </Box>
        ) : paginated.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ color: C.textSecondary }}>No tickets found</Typography>
          </Box>
        ) : (
          paginated.map((ticket, i) => {
            const sc = STATUS_COLORS[ticket.status] ?? { bg: "#F3F4F6", text: "#6B7280" };
            const pc = PRIORITY_COLORS[ticket.priority] ?? { bg: "#F3F4F6", text: "#6B7280" };
            return (
              <Box
                key={ticket.id}
                sx={{ display: "grid", gridTemplateColumns: "1.2fr 2.2fr 0.9fr 1fr 0.9fr 1.1fr 1.2fr 1fr", px: 3, py: 2, borderBottom: i < paginated.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center", "&:hover": { bgcolor: mode === "dark" ? "#1a1d2b" : "#F8FAFC" } }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 12, fontFamily: "monospace", color: "#D97706", fontWeight: 600 }}>{ticket.ticketNumber}</Typography>
                  {ticket.source === "WHATSAPP" && (
                    <Tooltip title="From WhatsApp">
                      <WhatsAppIcon sx={{ fontSize: 16, color: "#25D366" }} />
                    </Tooltip>
                  )}
                  {ticket.source === "EMAIL" && (
                    <Tooltip title="From Email">
                      <EmailIcon sx={{ fontSize: 16, color: "#EA4335" }} />
                    </Tooltip>
                  )}
                  {ticket.source === "PHONE" && (
                    <Tooltip title="From Phone">
                      <PhoneIcon sx={{ fontSize: 16, color: "#F59E0B" }} />
                    </Tooltip>
                  )}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}>{ticket.subject}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 11, color: C.textSecondary }}>{ticket.category}</Typography>
                    {ticket.source === "WHATSAPP" && (
                      <Chip 
                        icon={<WhatsAppIcon sx={{ fontSize: 12 }} />}
                        label="WhatsApp" 
                        size="small" 
                        sx={{ 
                          bgcolor: "#E7F5EC", 
                          color: "#25D366", 
                          fontWeight: 600, 
                          fontSize: 10, 
                          height: 18,
                          "& .MuiChip-icon": { color: "#25D366", ml: 0.5 }
                        }} 
                      />
                    )}
                  </Box>
                </Box>
                <Chip label={ticket.priority} size="small" sx={{ bgcolor: pc.bg, color: pc.text, fontWeight: 600, fontSize: 11, height: 22 }} />
                <Chip label={ticket.status.replace(/_/g, " ")} size="small" sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 600, fontSize: 11, height: 22 }} />
                
                {/* SLA Indicator */}
                <Box>
                  <SLAIndicator
                    slaDeadline={ticket.slaDeadline}
                    slaBreached={ticket.slaBreached}
                    status={ticket.status}
                    compact
                  />
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {ticket.assignedToName ? (
                    <>
                      <Avatar sx={{ width: 22, height: 22, bgcolor: "#7C3AED", fontSize: 10 }}>
                        {ticket.assignedToName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </Avatar>
                      <Typography sx={{ fontSize: 12, color: C.textPrimary }}>{ticket.assignedToName}</Typography>
                    </>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: C.textSecondary, fontStyle: "italic" }}>Unassigned</Typography>
                  )}
                </Box>
                <Typography sx={{ fontSize: 12, color: C.textSecondary }}>{ticket.createdByName}</Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Tooltip title="View details">
                    <Button size="small" onClick={() => navigate(buildPath(PATHS.ADMIN_TICKET_DETAIL, { id: ticket.id }))}
                      sx={{ minWidth: 32, p: 0.5, color: C.primary }}>
                      <VisibilityIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                  <Tooltip title={ticket.status === "CLOSED" ? "Ticket closed" : "Assign technician"}>
                    <span>
                      <Button size="small" onClick={() => openAssign(ticket)} disabled={ticket.status === "CLOSED"}
                        sx={{ minWidth: 32, p: 0.5, color: "#D97706" }}>
                        <AssignmentIndIcon fontSize="small" />
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title="Delete ticket">
                    <Button size="small" onClick={() => handleDelete(ticket)}
                      sx={{ minWidth: 32, p: 0.5, color: "#DC2626", "&:hover": { bgcolor: "#FEE2E2" } }}>
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            );
          })
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderTop: `1px solid ${C.border}` }}>
            <Typography sx={{ fontSize: 13, color: C.textSecondary }}>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" disabled={page === 1} onClick={() => setPage(page - 1)} sx={{ textTransform: "none", color: C.textPrimary, border: `1px solid ${C.border}` }}>Previous</Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Button key={p} size="small" onClick={() => setPage(p)} sx={{ textTransform: "none", minWidth: 36, bgcolor: p === page ? C.primary : "transparent", color: p === page ? "white" : C.textPrimary, border: `1px solid ${C.border}` }}>{p}</Button>
              ))}
              <Button size="small" disabled={page === totalPages} onClick={() => setPage(page + 1)} sx={{ textTransform: "none", color: C.textPrimary, border: `1px solid ${C.border}` }}>Next</Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Ticket</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 2 }}>
            {selectedTicket?.ticketNumber} — {selectedTicket?.subject}
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>Select a technician</MenuItem>
              {technicians.map((tech) => (
                <MenuItem key={tech.id} value={tech.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: "#7C3AED", fontSize: 10 }}>
                      {tech.firstName[0]}{tech.lastName[0]}
                    </Avatar>
                    {tech.firstName} {tech.lastName}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {technicians.length === 0 && (
            <Typography sx={{ fontSize: 12, color: "#EF4444", mt: 1 }}>
              No active technicians found. Add technicians in Manage Users first.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignDialogOpen(false)} sx={{ textTransform: "none", color: "#6B7280" }}>Cancel</Button>
          <Button
            variant="contained" onClick={handleAssign}
            disabled={!selectedTechId || assigning}
            startIcon={assigning ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ bgcolor: "#2563EB", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}
          >
            {assigning ? "Assigning…" : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminTicketsPage;
