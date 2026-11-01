import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SendIcon from "@mui/icons-material/Send";
import TechnicianLayout from "../../layouts/TechnicianLayout";
import RatingDisplay from "../../components/RatingDisplay";
import SLAIndicator from "../../components/SLAIndicator";
import { Timeline } from "../../components/tickets/Timeline";
import { 
  getAllTicketsApi, 
  getTicketByIdApi, 
  updateTicketStatusApi, 
  getCommentsApi, 
  addCommentApi,
  claimTicketApi,
  startWorkApi,
  putOnHoldApi,
  resumeTicketApi,
  resolveTicketApi,
  reopenTicketApi,
  deleteTicketApi,
  getTicketHistoryApi,
  type TicketDTO, 
  type CommentDTO,
  type TicketHistoryEntry
} from "../../services/tickets.service";
import { getRatingApi, type Rating } from "../../services/ratings.service";
import { useAuthStore, useNotificationStore } from "../../store";
import { PATHS, buildPath } from "../../routes/paths";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#EFF6FF", text: "#2563EB" },
  IN_PROGRESS: { bg: "#FEF3C7", text: "#D97706" },
  WAITING_FOR_USER: { bg: "#F3E8FF", text: "#7C3AED" },
  RESOLVED: { bg: "#ECFDF5", text: "#059669" },
  CLOSED: { bg: "#F3F4F6", text: "#6B7280" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  HIGH: { bg: "#FEE2E2", text: "#DC2626" },
  MEDIUM: { bg: "#FEF3C7", text: "#D97706" },
  LOW: { bg: "#ECFDF5", text: "#059669" },
  CRITICAL: { bg: "#FDF2F8", text: "#9D174D" },
};

export function TechnicianTicketsList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const loadTickets = () => {
    setLoading(true);
    if (user?.id) {
      getAllTicketsApi()
        .then((all) => {
          const myTickets = all.filter((t) => String(t.assignedToId) === String(user.id));
          setTickets(myTickets);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadTickets();
    
    // Actualisation automatique toutes les 10 secondes
    const interval = setInterval(() => {
      loadTickets();
    }, 10000); // 10 secondes
    
    // Nettoyer l'intervalle quand le composant est démonté
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleDeleteTicket = async (ticket: TicketDTO) => {
    if (!confirm(`Are you sure you want to delete ticket ${ticket.ticketNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteTicketApi(ticket.id);
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      useNotificationStore.getState().addNotification(`Ticket ${ticket.ticketNumber} deleted successfully`, "success");
    } catch (error: any) {
      useNotificationStore.getState().addNotification(error.response?.data?.message || "Failed to delete ticket", "error");
    }
  };

  if (!user) {
    return (
      <TechnicianLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <CircularProgress />
        </Box>
      </TechnicianLayout>
    );
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
    const matchesType = !typeFilter || ticket.category === typeFilter;
    const matchesCompany = !companyFilter || ticket.category.toLowerCase().includes(companyFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesCompany;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const paginatedTickets = filteredTickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categories = [...new Set(tickets.map((t) => t.category))];

  const activeCount = tickets.filter((t) => !["RESOLVED", "CLOSED"].includes(t.status)).length;
  const waitingCount = tickets.filter((t) => t.status === "WAITING_FOR_USER").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <TechnicianLayout>
      {/* Header Card */}
      <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, bgcolor: "white", p: 3, mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1F2937", mb: 0.5, fontSize: 28 }}>
              My Tickets
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
              Manage and track all tickets assigned to you.
            </Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: 13, mt: 0.5 }}>
              {activeCount} Active Tickets • {waitingCount} Waiting • {resolvedCount} Resolved
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTickets}
            sx={{ textTransform: "none", borderColor: "#E5E7EB", color: "#374151", fontWeight: 500, borderRadius: 1.5 }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Filters Card */}
      <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, bgcolor: "white", p: 2.5, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            placeholder="Search tickets..."
            size="small"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="OPEN">Open</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="WAITING_FOR_USER">Waiting</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              label="Priority"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              label="Type"
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Company</InputLabel>
            <Select
              value={companyFilter}
              onChange={(e) => { setCompanyFilter(e.target.value); setPage(1); }}
              label="Company"
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="text"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setPriorityFilter("");
              setTypeFilter("");
              setCompanyFilter("");
              setPage(1);
            }}
            sx={{ textTransform: "none", color: "#6B7280", whiteSpace: "nowrap" }}
          >
            Reset Filters
          </Button>
        </Box>
      </Paper>

      {/* My Tickets Table */}
      <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, bgcolor: "white" }}>
        <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
            My Tickets
          </Typography>
        </Box>

        <Box sx={{ overflow: "hidden" }}>
          {/* Table Header */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 0.8fr 1fr 1fr 1fr 0.8fr", px: 3, py: 2, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Ticket ID</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Title</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Requester</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Company</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Priority</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Status</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Assigned Date</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>SLA</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>Action</Typography>
          </Box>

          {/* Table Rows */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredTickets.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography sx={{ color: "#9CA3AF", mb: 1 }}>No tickets found</Typography>
              <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>
                {searchQuery || statusFilter || priorityFilter ? "Try adjusting your filters" : "No tickets assigned to you"}
              </Typography>
            </Box>
          ) : (
            paginatedTickets.map((ticket, index) => {
              const statusColor = STATUS_COLORS[ticket.status] || { bg: "#F3F4F6", text: "#6B7280" };
              const priorityColor = PRIORITY_COLORS[ticket.priority] || { bg: "#F3F4F6", text: "#6B7280" };

              return (
                <Box
                  key={ticket.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr 1fr 1fr 0.8fr 1fr 1fr 1fr 0.8fr",
                    px: 3,
                    py: 2.5,
                    borderBottom: index < paginatedTickets.length - 1 ? "1px solid #E5E7EB" : "none",
                    alignItems: "center",
                    "&:hover": { bgcolor: "#F9FAFB" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>
                      {ticket.ticketNumber}
                    </Typography>
                    {ticket.source === "WHATSAPP" && (
                      <WhatsAppIcon sx={{ fontSize: 16, color: "#25D366" }} />
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, color: "#1F2937" }}>
                      {ticket.subject}
                    </Typography>
                    {ticket.source === "WHATSAPP" && (
                      <Chip 
                        icon={<WhatsAppIcon sx={{ fontSize: 11 }} />}
                        label="WhatsApp" 
                        size="small" 
                        sx={{ 
                          bgcolor: "#E7F5EC", 
                          color: "#25D366", 
                          fontWeight: 600, 
                          fontSize: 10, 
                          height: 16,
                          mt: 0.5,
                          "& .MuiChip-icon": { color: "#25D366", ml: 0.5 }
                        }} 
                      />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                    {ticket.createdByName}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                    {ticket.category}
                  </Typography>
                  <Chip
                    label={ticket.priority}
                    size="small"
                    sx={{ bgcolor: priorityColor.bg, color: priorityColor.text, fontWeight: 600, fontSize: 11, width: "fit-content" }}
                  />
                  <Chip
                    label={ticket.status.replace(/_/g, " ")}
                    size="small"
                    sx={{ bgcolor: statusColor.bg, color: statusColor.text, fontWeight: 600, fontSize: 11, width: "fit-content" }}
                  />
                  <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB")}
                  </Typography>
                  <Box>
                    <SLAIndicator
                      slaDeadline={ticket.slaDeadline}
                      slaBreached={ticket.slaBreached}
                      status={ticket.status}
                      compact
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Button
                      size="small"
                      onClick={() => navigate(buildPath(PATHS.TECHNICIAN_TICKET_DETAIL, { id: ticket.id }))}
                      sx={{ textTransform: "none", color: "#2563EB", fontWeight: 600, fontSize: 12 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleDeleteTicket(ticket)}
                      sx={{ 
                        minWidth: 32, 
                        p: 0.5, 
                        color: "#DC2626", 
                        "&:hover": { bgcolor: "#FEE2E2" } 
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              );
            })
          )}

          {/* Pagination */}
          {filteredTickets.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderTop: "1px solid #E5E7EB" }}>
              <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredTickets.length)} of {filteredTickets.length} tickets
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Button
                  size="small"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  sx={{ minWidth: 32, color: "#6B7280" }}
                >
                  {"<"}
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    size="small"
                    onClick={() => setPage(p)}
                    sx={{
                      minWidth: 32,
                      bgcolor: p === page ? "#1F2937" : "transparent",
                      color: p === page ? "white" : "#6B7280",
                      "&:hover": { bgcolor: p === page ? "#374151" : "#F3F4F6" },
                    }}
                  >
                    {p}
                  </Button>
                ))}
                {totalPages > 7 && <Typography sx={{ px: 0.5, color: "#6B7280" }}>...</Typography>}
                {totalPages > 7 && (
                  <Button size="small" onClick={() => setPage(totalPages)} sx={{ minWidth: 32, color: "#6B7280" }}>
                    {totalPages}
                  </Button>
                )}
                <Button
                  size="small"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  sx={{ minWidth: 32, color: "#6B7280" }}
                >
                  {">"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </TechnicianLayout>
  );
}

export function TechnicianTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (id) {
      Promise.all([getTicketByIdApi(id), getCommentsApi(id), getRatingApi(id)])
        .then(([ticketData, commentsData, ratingData]) => {
          setTicket(ticketData);
          setComments(commentsData);
          setRating(ratingData);
          setNewStatus(ticketData.status);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    try {
      const comment = await addCommentApi(id, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!ticket || newStatus === ticket.status) return;
    try {
      const updated = await updateTicketStatusApi(ticket.id, newStatus);
      setTicket(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <TechnicianLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <CircularProgress />
        </Box>
      </TechnicianLayout>
    );
  }

  if (!ticket) {
    return (
      <TechnicianLayout>
        <Typography>Ticket not found</Typography>
      </TechnicianLayout>
    );
  }

  const statusColor = STATUS_COLORS[ticket.status] || { bg: "#F3F4F6", text: "#6B7280" };
  const priorityColor = PRIORITY_COLORS[ticket.priority] || { bg: "#F3F4F6", text: "#6B7280" };

  return (
    <TechnicianLayout>
      <Button
        onClick={() => navigate(PATHS.TECHNICIAN_TICKETS)}
        sx={{ mb: 3, textTransform: "none", color: "#6B7280" }}
      >
        ← Back to My Tickets
      </Button>

      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 3 }}>
        {/* Left Column */}
        <Box>
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, p: 3, mb: 3 }}>
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", mb: 1 }}>{ticket.ticketNumber}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}>
              {ticket.subject}
            </Typography>
            <Typography sx={{ color: "#6B7280", mb: 3 }}>
              {ticket.description}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Chip label={ticket.priority} sx={{ bgcolor: priorityColor.bg, color: priorityColor.text, fontWeight: 600 }} />
              <Chip label={ticket.status.replace(/_/g, " ")} sx={{ bgcolor: statusColor.bg, color: statusColor.text, fontWeight: 600 }} />
            </Box>
          </Paper>

          {/* Comments */}
          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2 }}>
            <Box sx={{ p: 3, borderBottom: "1px solid #E5E7EB" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937" }}>
                Comments
              </Typography>
            </Box>
            <Box sx={{ p: 3, maxHeight: 400, overflowY: "auto" }}>
              {comments.map((comment) => (
                <Box key={comment.id} sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1F2937", fontSize: 14, mb: 0.5 }}>
                    {comment.authorName}
                  </Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: 13 }}>
                    {comment.content}
                  </Typography>
                  <Typography sx={{ color: "#9CA3AF", fontSize: 12, mt: 0.5 }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ p: 3, borderTop: "1px solid #E5E7EB" }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                sx={{ bgcolor: "#2563EB", textTransform: "none" }}
              >
                Add Comment
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Right Column */}
        <Box>
          {/* Rating Display (si le ticket est CLOSED et qu'il y a une note) */}
          {ticket.status === "CLOSED" && rating && (
            <Box sx={{ mb: 3 }}>
              <RatingDisplay
                rating={rating.rating}
                comment={rating.comment}
                createdByName={rating.createdByName}
                createdAt={rating.createdAt}
              />
            </Box>
          )}

          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}>
              Ticket Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Requester</Typography>
              <Typography sx={{ fontSize: 14, color: "#1F2937", fontWeight: 500 }}>{ticket.createdByName}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Category</Typography>
              <Typography sx={{ fontSize: 14, color: "#1F2937", fontWeight: 500 }}>{ticket.category}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Created</Typography>
              <Typography sx={{ fontSize: 14, color: "#1F2937", fontWeight: 500 }}>
                {new Date(ticket.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}>
              Update Status
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="WAITING_FOR_USER">Waiting for User</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              onClick={handleUpdateStatus}
              disabled={newStatus === ticket.status}
              sx={{ bgcolor: "#2563EB", textTransform: "none" }}
            >
              Update Status
            </Button>
          </Paper>
        </Box>
      </Box>
    </TechnicianLayout>
  );
}
