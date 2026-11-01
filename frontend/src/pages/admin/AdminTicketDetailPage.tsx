import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AdminLayout from "../../layouts/AdminLayout";
import RatingDisplay from "../../components/RatingDisplay";
import { getTicketByIdApi, updateTicketStatusApi, assignTicketApi, getCommentsApi, addCommentApi, type TicketDTO, type CommentDTO } from "../../services/tickets.service";
import { getRatingApi, type Rating } from "../../services/ratings.service";
import { getUsers, type UserDTO } from "../../services/users.service";
import { useAuthStore, useNotificationStore } from "../../store";
import { useThemeStore } from "../../store";
import { getAdminColors } from "../../styles/adminTheme";
import { PATHS } from "../../routes/paths";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#EFF6FF", text: "#2563EB" },
  IN_PROGRESS: { bg: "#FEF3C7", text: "#D97706" },
  WAITING_FOR_USER: { bg: "#F3E8FF", text: "#7C3AED" },
  RESOLVED: { bg: "#ECFDF5", text: "#059669" },
  CLOSED: { bg: "#F3F4F6", text: "#6B7280" },
};

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED"];

function AdminTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mode } = useThemeStore();
  const C = getAdminColors(mode);
  const { addNotification } = useNotificationStore();

  const [ticket, setTicket] = useState<TicketDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [technicians, setTechnicians] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newTechId, setNewTechId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  useEffect(() => {
    if (!id) return;
    Promise.all([getTicketByIdApi(id), getCommentsApi(id), getUsers(), getRatingApi(id)])
      .then(([t, c, u, r]) => {
        setTicket(t);
        setComments(c);
        setRating(r);
        setNewStatus(t.status);
        setNewTechId(t.assignedToId ?? "");
        setTechnicians(u.filter((x) => x.role === "TECHNICIAN" && x.status === "ACTIVE"));
      })
      .catch(() => { addNotification("Failed to load ticket", "error"); navigate(PATHS.ADMIN_TICKETS); })
      .finally(() => setLoading(false));
  }, [id, navigate, addNotification]);

  const handleUpdateStatus = async () => {
    if (!ticket || newStatus === ticket.status) return;
    setSavingStatus(true);
    try {
      const updated = await updateTicketStatusApi(ticket.id, newStatus);
      setTicket(updated);
      addNotification(`Status updated to ${newStatus.replace(/_/g, " ")}`, "success");
    } catch { addNotification("Failed to update status", "error"); }
    finally { setSavingStatus(false); }
  };

  const handleAssign = async () => {
    if (!ticket || !newTechId || newTechId === ticket.assignedToId) return;
    setSavingAssign(true);
    try {
      const updated = await assignTicketApi(ticket.id, newTechId);
      setTicket(updated);
      addNotification(`Ticket assigned to ${updated.assignedToName}`, "success");
    } catch { addNotification("Failed to assign ticket", "error"); }
    finally { setSavingAssign(false); }
  };

  const handleSend = async () => {
    if (!reply.trim() || !id || sending) return;
    setSending(true);
    try {
      const c = await addCommentApi(id, reply.trim());
      setComments((prev) => [...prev, c]);
      setReply("");
    } catch { addNotification("Failed to send comment", "error"); }
    finally { setSending(false); }
  };

  if (loading) {
    return (
      <AdminLayout title="Ticket Detail">
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      </AdminLayout>
    );
  }
  if (!ticket) return null;

  const sc = STATUS_COLORS[ticket.status] ?? { bg: "#F3F4F6", text: "#6B7280" };
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "AD";

  return (
    <AdminLayout title={`Ticket — ${ticket.ticketNumber}`}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(PATHS.ADMIN_TICKETS)}
        sx={{ textTransform: "none", color: C.textSecondary, mb: 2, pl: 0, "&:hover": { bgcolor: "transparent" } }}>
        Back to All Tickets
      </Button>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 12, fontFamily: "monospace", color: "#D97706", mb: 0.5 }}>{ticket.ticketNumber}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: C.textPrimary }}>{ticket.subject}</Typography>
          <Typography sx={{ fontSize: 13, color: C.textSecondary, mt: 0.5 }}>By {ticket.createdByName} · {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</Typography>
        </Box>
        <Chip label={ticket.status.replace(/_/g, " ")} sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 700 }} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
        {/* Left — info + comments */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Description */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${C.border}`, bgcolor: C.cardBg }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary, mb: 2 }}>Description</Typography>
            <Box sx={{ bgcolor: mode === "dark" ? "#0F172A" : "#F9FAFB", borderRadius: 1.5, p: 2.5, border: `1px solid ${C.border}` }}>
              <Typography sx={{ fontSize: 14, color: C.textPrimary, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{ticket.description}</Typography>
            </Box>
          </Paper>

          {/* Conversation */}
          <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${C.border}`, bgcolor: C.cardBg }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${C.border}` }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary }}>Conversation</Typography>
            </Box>
            <Box sx={{ px: 3, py: 2, maxHeight: 350, overflowY: "auto" }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#6B7280", fontSize: 11, flexShrink: 0 }}>SY</Avatar>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, mb: 0.5 }}>System</Typography>
                  <Box sx={{ bgcolor: mode === "dark" ? "#0F172A" : "#F9FAFB", borderRadius: 1.5, px: 2, py: 1.5, border: `1px solid ${C.border}` }}>
                    <Typography sx={{ fontSize: 13, color: C.textPrimary }}>Ticket received and queued for processing.</Typography>
                  </Box>
                </Box>
              </Box>
              {comments.map((comment) => {
                const isMe = comment.authorId === user?.id;
                return (
                  <Box key={comment.id} sx={{ display: "flex", gap: 2, mb: 2.5, flexDirection: isMe ? "row-reverse" : "row" }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: isMe ? C.primary : "#7C3AED", fontSize: 11, flexShrink: 0 }}>
                      {comment.authorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </Avatar>
                    <Box sx={{ maxWidth: "75%" }}>
                      <Box sx={{ display: "flex", gap: 1, mb: 0.5, flexDirection: isMe ? "row-reverse" : "row", alignItems: "center" }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{isMe ? "You" : comment.authorName}</Typography>
                        <Typography sx={{ fontSize: 11, color: C.textSecondary }}>{new Date(comment.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</Typography>
                      </Box>
                      <Box sx={{ bgcolor: isMe ? "#EFF6FF" : mode === "dark" ? "#0F172A" : "#F9FAFB", borderRadius: 1.5, px: 2, py: 1.5, border: `1px solid ${C.border}` }}>
                        <Typography sx={{ fontSize: 13, color: C.textPrimary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{comment.content}</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </Box>
            {ticket.status !== "CLOSED" && (
              <>
                <Divider sx={{ bgcolor: C.border }} />
                <Box sx={{ px: 3, py: 2, display: "flex", gap: 2, alignItems: "flex-end" }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: C.primary, fontSize: 10, mb: 0.5, flexShrink: 0 }}>{userInitials}</Avatar>
                  <TextField fullWidth multiline minRows={1} maxRows={3} size="small" placeholder="Add a comment…"
                    value={reply} onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    disabled={sending} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                  <Button variant="contained" onClick={handleSend} disabled={!reply.trim() || sending}
                    endIcon={sending ? <CircularProgress size={13} color="inherit" /> : <SendIcon fontSize="small" />}
                    sx={{ bgcolor: C.primary, textTransform: "none", fontWeight: 600, borderRadius: 2, mb: 0.5, flexShrink: 0, "&:hover": { bgcolor: "#1D4ED8" } }}>
                    Send
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>

        {/* Right — management panel */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Rating Display (si le ticket est CLOSED et qu'il y a une note) */}
          {ticket.status === "CLOSED" && rating && (
            <RatingDisplay
              rating={rating.rating}
              comment={rating.comment}
              createdByName={rating.createdByName}
              createdAt={rating.createdAt}
            />
          )}

          {/* Ticket Info */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${C.border}`, bgcolor: C.cardBg }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary, mb: 2 }}>Ticket Info</Typography>
            {[
              { label: "Category", value: ticket.category },
              { label: "Priority", value: ticket.priority },
              { label: "Impact", value: ticket.impact.replace(/_/g, " ") },
              { label: "Created By", value: ticket.createdByName },
              { label: "Created At", value: new Date(ticket.createdAt).toLocaleDateString("en-GB") },
              { label: "Updated At", value: new Date(ticket.updatedAt).toLocaleDateString("en-GB") },
              ...(ticket.resolvedAt ? [{ label: "Resolved At", value: new Date(ticket.resolvedAt).toLocaleDateString("en-GB") }] : []),
            ].map((row) => (
              <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={{ fontSize: 12, color: C.textSecondary }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 12, color: C.textPrimary, fontWeight: 500 }}>{row.value}</Typography>
              </Box>
            ))}
          </Paper>

          {/* Change Status */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${C.border}`, bgcolor: C.cardBg }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary, mb: 2 }}>Update Status</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>)}
              </Select>
            </FormControl>
            <Button fullWidth variant="contained" onClick={handleUpdateStatus}
              disabled={savingStatus || newStatus === ticket.status}
              startIcon={savingStatus ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{ bgcolor: C.primary, textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#1D4ED8" } }}>
              {savingStatus ? "Updating…" : "Update Status"}
            </Button>
          </Paper>

          {/* Assign Technician */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${C.border}`, bgcolor: C.cardBg }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: C.textPrimary, mb: 2 }}>Assign Technician</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Technician</InputLabel>
              <Select value={newTechId} onChange={(e) => setNewTechId(e.target.value)} label="Technician" disabled={ticket.status === "CLOSED"}>
                <MenuItem value="">Unassigned</MenuItem>
                {technicians.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 20, height: 20, bgcolor: "#7C3AED", fontSize: 9 }}>{t.firstName[0]}{t.lastName[0]}</Avatar>
                      {t.firstName} {t.lastName}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button fullWidth variant="contained" onClick={handleAssign}
              disabled={savingAssign || !newTechId || newTechId === ticket.assignedToId || ticket.status === "CLOSED"}
              startIcon={savingAssign ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{ bgcolor: "#7C3AED", textTransform: "none", fontWeight: 600, "&:hover": { bgcolor: "#6D28D9" } }}>
              {savingAssign ? "Assigning…" : "Assign Ticket"}
            </Button>
          </Paper>
        </Box>
      </Box>
    </AdminLayout>
  );
}

export default AdminTicketDetailPage;
