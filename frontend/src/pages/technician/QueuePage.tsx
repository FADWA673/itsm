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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useNavigate } from "react-router-dom";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import { apiClient } from "../../services/api";
import SLAIndicator from "../../components/SLAIndicator";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdByName: string;
  createdAt: string;
  // SLA Fields
  slaDeadline?: string | null;
  slaBreached: boolean;
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  LOW: { bg: "#ECFDF5", text: "#059669" },
  MEDIUM: { bg: "#FFFBEB", text: "#D97706" },
  HIGH: { bg: "#FEF2F2", text: "#DC2626" },
  CRITICAL: { bg: "#FDF2F8", text: "#9D174D" },
};

function QueuePage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const categories = Array.from(new Set(tickets.map((t) => t.category)));

  useEffect(() => {
    loadQueue();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, search, priorityFilter, categoryFilter]);

  const loadQueue = async () => {
    try {
      const response = await apiClient.get("/tickets/queue");
      setTickets(response.data.data);
    } catch (error) {
      console.error("Failed to load queue:", error);
      alert("Failed to load unassigned tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (ticketId: string) => {
    setClaiming(ticketId);
    try {
      console.log("=== FRONTEND: Claiming ticket ===");
      console.log("Ticket ID:", ticketId);
      console.log("API URL:", `/tickets/${ticketId}/claim`);
      
      const response = await apiClient.post(`/tickets/${ticketId}/claim`);
      
      console.log("=== FRONTEND: Claim successful ===");
      console.log("Response:", response.data);
      
      alert("Ticket claimed successfully!");
      // Remove from queue
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    } catch (error: any) {
      console.error("=== FRONTEND: Claim failed ===");
      console.error("Error:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to claim ticket";
      alert(errorMessage);
    } finally {
      setClaiming(null);
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

    // Priority filter
    if (priorityFilter !== "ALL") {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }

    // Sort by priority (CRITICAL → HIGH → MEDIUM → LOW)
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    filtered.sort((a, b) => {
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 999;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 999;
      return aPriority - bPriority;
    });

    setFilteredTickets(filtered);
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
          Ticket Queue
        </Typography>
        <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
          Unassigned tickets waiting to be claimed
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
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
              <MenuItem value="ALL">All Priorities</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </Select>
          </FormControl>

          {categories.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="Category">
                <MenuItem value="ALL">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => {
              setSearch("");
              setPriorityFilter("ALL");
              setCategoryFilter("ALL");
            }}
            sx={{ textTransform: "none" }}
          >
            Clear
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
          <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
            {filteredTickets.length === 0
              ? "No unassigned tickets"
              : `Showing ${filteredTickets.length} of ${tickets.length} unassigned tickets`}
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
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>SLA</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>REQUESTER</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280" }}>CREATED</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, color: "#6B7280", textAlign: "center" }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#9CA3AF" }}>
                    {tickets.length === 0
                      ? "All tickets are assigned! 🎉"
                      : "No tickets match your filters"}
                  </Typography>
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
                    <SLAIndicator
                      slaDeadline={ticket.slaDeadline || null}
                      slaBreached={ticket.slaBreached}
                      status={ticket.status}
                      compact
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 13, color: "#374151" }}>{ticket.createdByName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={claiming === ticket.id ? <CircularProgress size={14} /> : <PlayArrowIcon fontSize="small" />}
                      onClick={() => handleClaim(ticket.id)}
                      disabled={claiming === ticket.id}
                      sx={{
                        textTransform: "none",
                        fontSize: 12,
                        bgcolor: "#2563EB",
                        "&:hover": { bgcolor: "#1E40AF" },
                      }}
                    >
                      Claim
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </TechnicianLayout>
  );
}

export default QueuePage;
