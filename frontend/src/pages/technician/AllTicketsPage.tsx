import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CircularProgress from "@mui/material/CircularProgress";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate } from "react-router-dom";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import { apiClient } from "../../services/api";
import { deleteTicketApi } from "../../services/tickets.service";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdByName: string;
  assignedToName: string | null;
  createdAt: string;
}

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

// Updated: Button de suppression ajouté
function AllTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
    
    // Actualisation automatique toutes les 10 secondes
    const interval = setInterval(() => {
      loadTickets();
    }, 10000); // 10 secondes
    
    // Nettoyer l'intervalle quand le composant est démonté
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, search, statusFilter, priorityFilter]);

  const loadTickets = async () => {
    try {
      const response = await apiClient.get("/tickets");
      setTickets(response.data.data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    // Search
    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.createdByName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "ALL") {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleDeleteClick = (ticketId: string) => {
    setTicketToDelete(ticketId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ticketToDelete) return;
    
    try {
      await deleteTicketApi(ticketToDelete);
      // Recharger les tickets après suppression
      await loadTickets();
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      alert("Erreur lors de la suppression du ticket");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTicketToDelete(null);
  };

  if (loading) {
    return (
      <TechnicianLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
          All Tickets
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
          View and manage all support tickets across the organization
        </Typography>
      </Paper>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by ticket #, subject, requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="WAITING_FOR_USER">Waiting for User</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
              <MenuItem value="ALL">All Priorities</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setPriorityFilter("ALL");
            }}
            sx={{ textTransform: "none" }}
          >
            Clear
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
          <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
            Showing {filteredTickets.length} of {tickets.length} tickets
          </Typography>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>TICKET #</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>SUBJECT</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>CATEGORY</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>PRIORITY</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>REQUESTER</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>ASSIGNED TO</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>CREATED</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280", textAlign: "center" }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#9CA3AF" }}>No tickets found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} hover sx={{ "&:hover": { bgcolor: "#F9FAFB" } }}>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#2563EB" }}>
                      {ticket.ticketNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>{ticket.subject}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={ticket.category} size="small" sx={{ fontSize: 11 }} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority}
                      size="small"
                      sx={{
                        bgcolor: PRIORITY_COLORS[ticket.priority]?.bg,
                        color: PRIORITY_COLORS[ticket.priority]?.text,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status.replace(/_/g, " ")}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[ticket.status]?.bg,
                        color: STATUS_COLORS[ticket.status]?.text,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>{ticket.createdByName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>
                      {ticket.assignedToName || <span style={{ color: "#9CA3AF" }}>Unassigned</span>}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: "center" }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon fontSize="small" />}
                        onClick={() => navigate(`/technician/tickets/${ticket.id}`)}
                        sx={{ textTransform: "none", fontSize: 12 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon fontSize="small" />}
                        onClick={() => handleDeleteClick(ticket.id)}
                        sx={{ textTransform: "none", fontSize: 12 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ textTransform: "none" }}>
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ textTransform: "none" }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </TechnicianLayout>
  );
}

export default AllTicketsPage;
