import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CategoryIcon from "@mui/icons-material/Category";
import FlagIcon from "@mui/icons-material/Flag";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import FileUpload from "../../components/attachments/FileUpload";
import AttachmentsList from "../../components/attachments/AttachmentsList";
import RatingDialog from "../../components/RatingDialog";
import RatingDisplay from "../../components/RatingDisplay";
import SLAIndicator from "../../components/SLAIndicator";
import {
  getTicketByIdApi,
  getCommentsApi,
  addCommentApi,
  confirmResolutionApi,
  cancelTicketApi,
  resumeTicketApi,
  getTicketHistoryApi,
  type TicketDTO,
  type CommentDTO,
  type TicketHistoryEntry,
} from "../../services/tickets.service";
import { getRatingApi, createRatingApi, type Rating } from "../../services/ratings.service";
import { useAuthStore, useNotificationStore } from "../../store";
import { PATHS } from "../../routes/paths";
import { Timeline } from "../../components/tickets/Timeline";

// ─── Color maps ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#EFF6FF", text: "#2563EB" },
  ASSIGNED: { bg: "#FEF3C7", text: "#F59E0B" },
  IN_PROGRESS: { bg: "#DBEAFE", text: "#1D4ED8" },
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

const PRIVILEGED_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEPT_MANAGER", "TECHNICIAN"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface TimelineEvent { id: string; label: string; date: string; color: string; }

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
      {icon && <Box sx={{ color: "#9CA3AF", mt: 0.3, flexShrink: 0 }}>{icon}</Box>}
      <Box>
        <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#374151", fontWeight: 500, mt: 0.2 }}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [ticket, setTicket] = useState<TicketDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [history, setHistory] = useState<TicketHistoryEntry[]>([]);
  const [rating, setRating] = useState<Rating | null>(null);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmingResolution, setConfirmingResolution] = useState(false);
  const [cancellingTicket, setCancellingTicket] = useState(false);
  const [resumingTicket, setResumingTicket] = useState(false);
  const [attachmentsRefresh, setAttachmentsRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousCommentsLengthRef = useRef<number>(0);

  // Scroll to bottom only when a NEW comment is added (not on initial load)
  useEffect(() => {
    if (comments.length > previousCommentsLengthRef.current && previousCommentsLengthRef.current > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    previousCommentsLengthRef.current = comments.length;
  }, [comments]);

  // Load ticket
  useEffect(() => {
    if (!id) return;
    setLoadingTicket(true);
    getTicketByIdApi(id)
      .then(setTicket)
      .catch(() => {
        addNotification("Failed to load ticket", "error");
        navigate(PATHS.EMPLOYEE_TICKETS);
      })
      .finally(() => setLoadingTicket(false));
  }, [id, navigate, addNotification]);

  // Load comments
  useEffect(() => {
    if (!id) return;
    setLoadingComments(true);
    getCommentsApi(id)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [id]);

  // Load rating
  useEffect(() => {
    if (!id) return;
    getRatingApi(id).then(setRating).catch(() => {});
  }, [id]);

  // Load history
  useEffect(() => {
    if (!id) return;
    setLoadingHistory(true);
    getTicketHistoryApi(id)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [id]);

  const handleSend = async () => {
    if (!reply.trim() || !id || sending) return;
    setSending(true);
    try {
      const newComment = await addCommentApi(id, reply.trim());
      setComments((prev) => [...prev, newComment]);
      setReply("");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Failed to send reply";
      addNotification(msg, "error");
    } finally {
      setSending(false);
    }
  };

  const handleSubmitRating = async (ratingValue: number, comment: string) => {
    if (!id) return;
    try {
      const newRating = await createRatingApi(id, ratingValue, comment);
      setRating(newRating);
      addNotification("Merci pour votre évaluation !", "success");
    } catch (error) {
      addNotification("Erreur lors de l'envoi de l'évaluation", "error");
    }
  };

  const handleConfirmResolution = async () => {
    if (!id || confirmingResolution) return;
    setConfirmingResolution(true);
    try {
      await confirmResolutionApi(id);
      addNotification("Resolution confirmed, ticket closed", "success");
      // Recharger le ticket pour voir le nouveau statut
      const updatedTicket = await getTicketByIdApi(id);
      setTicket(updatedTicket);
    } catch (error) {
      addNotification("Failed to confirm resolution", "error");
    } finally {
      setConfirmingResolution(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!id || cancellingTicket) return;
    if (!confirm("Are you sure you want to cancel this ticket?")) return;
    setCancellingTicket(true);
    try {
      await cancelTicketApi(id);
      addNotification("Ticket cancelled successfully", "success");
      navigate(PATHS.EMPLOYEE_TICKETS);
    } catch (error) {
      addNotification("Failed to cancel ticket", "error");
    } finally {
      setCancellingTicket(false);
    }
  };

  const handleResumeTicket = async () => {
    if (!id || resumingTicket) return;
    setResumingTicket(true);
    try {
      await resumeTicketApi(id);
      addNotification("Ticket resumed successfully", "success");
      // Recharger le ticket et l'historique
      const updatedTicket = await getTicketByIdApi(id);
      setTicket(updatedTicket);
      const updatedHistory = await getTicketHistoryApi(id);
      setHistory(updatedHistory);
    } catch (error) {
      addNotification("Failed to resume ticket", "error");
    } finally {
      setResumingTicket(false);
    }
  };

  if (loadingTicket) {
    return (
      <EmployeeLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <CircularProgress sx={{ color: "#2563EB" }} />
        </Box>
      </EmployeeLayout>
    );
  }

  if (!ticket) return null;

  const statusColor = STATUS_COLORS[ticket.status] ?? { bg: "#F3F4F6", text: "#6B7280" };
  const priorityColor = PRIORITY_COLORS[ticket.priority] ?? { bg: "#F3F4F6", text: "#6B7280" };
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "ME";
  const isClosed = ticket.status === "CLOSED";

  return (
    <EmployeeLayout>
      {/* ── Back + Header ── */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate(PATHS.EMPLOYEE_TICKETS)}
          sx={{ textTransform: "none", color: "#6B7280", fontWeight: 500, mb: 1.5, pl: 0, "&:hover": { bgcolor: "transparent", color: "#374151" } }}
        >
          Back to My Tickets
        </Button>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontFamily: "monospace", mb: 0.5 }}>
              {ticket.ticketNumber}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              {ticket.subject}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label={ticket.status.replace(/_/g, " ")} sx={{ bgcolor: statusColor.bg, color: statusColor.text, fontWeight: 700, fontSize: 12 }} />
            <Chip label={ticket.priority} sx={{ bgcolor: priorityColor.bg, color: priorityColor.text, fontWeight: 700, fontSize: 12 }} />
          </Box>
        </Box>
      </Box>

      {/* ── SLA Indicator ── */}
      <Box sx={{ mb: 3 }}>
        <SLAIndicator
          slaDeadline={ticket.slaDeadline}
          slaBreached={ticket.slaBreached}
          status={ticket.status}
          showDetails
        />
      </Box>

      {/* ── Ticket Info + Description ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" }, gap: 3, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827", mb: 2.5 }}>Ticket Information</Typography>
          <InfoRow label="Category" value={ticket.category} icon={<CategoryIcon fontSize="small" />} />
          <InfoRow label="Created" value={new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} icon={<AccessTimeIcon fontSize="small" />} />
          <InfoRow label="Last Updated" value={new Date(ticket.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} icon={<AccessTimeIcon fontSize="small" />} />
          <InfoRow label="Assigned To" value={ticket.assignedToName ?? "Not assigned yet"} icon={<PersonIcon fontSize="small" />} />
          <InfoRow label="Impact" value={ticket.impact.replace(/_/g, " ")} icon={<FlagIcon fontSize="small" />} />
          <InfoRow label="Ticket ID" value={ticket.ticketNumber} icon={<ConfirmationNumberIcon fontSize="small" />} />
          {ticket.resolvedAt && (
            <InfoRow label="Resolved At" value={new Date(ticket.resolvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} icon={<AccessTimeIcon fontSize="small" />} />
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827", mb: 2 }}>Description</Typography>
          <Box sx={{ bgcolor: "#F9FAFB", borderRadius: 1.5, p: 2.5, border: "1px solid #F3F4F6", minHeight: 120 }}>
            <Typography sx={{ fontSize: 14, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {ticket.description}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ── Timeline + Status ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.5fr" }, gap: 3, mb: 3 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827", mb: 2.5 }}>Activity Timeline</Typography>
          <Timeline history={history} loading={loadingHistory} />
        </Paper>

        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827", mb: 2 }}>Current Status</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 1.5, bgcolor: statusColor.bg, border: `1px solid ${statusColor.text}25`, mb: 2 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: statusColor.text, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: statusColor.text }}>
                {ticket.status.replace(/_/g, " ")}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.3 }}>
                {ticket.status === "OPEN" && "Your ticket is waiting to be assigned to a technician."}
                {ticket.status === "ASSIGNED" && "Your ticket has been assigned and the technician will start working on it soon."}
                {ticket.status === "IN_PROGRESS" && "A technician is currently working on your ticket."}
                {ticket.status === "WAITING_FOR_USER" && "The technician is waiting for your response."}
                {ticket.status === "RESOLVED" && "Your ticket has been resolved. Please confirm if the issue is fixed."}
                {ticket.status === "CLOSED" && "This ticket has been closed."}
              </Typography>

              {/* Actions rapides */}
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {/* Bouton Annuler (si OPEN, ASSIGNED ou IN_PROGRESS) */}
                {["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(ticket.status) && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={handleCancelTicket}
                    disabled={cancellingTicket}
                    sx={{ textTransform: "none", fontSize: 12 }}
                  >
                    {cancellingTicket ? "Cancelling..." : "Cancel Ticket"}
                  </Button>
                )}

                {/* Bouton Reprendre (si WAITING_FOR_USER) */}
                {ticket.status === "WAITING_FOR_USER" && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={handleResumeTicket}
                    disabled={resumingTicket}
                    startIcon={resumingTicket ? <CircularProgress size={14} color="inherit" /> : null}
                    sx={{ textTransform: "none", fontSize: 12 }}
                  >
                    {resumingTicket ? "Resuming..." : "▶ Resume Ticket"}
                  </Button>
                )}

                {/* Bouton Confirmer résolution (si RESOLVED) */}
                {ticket.status === "RESOLVED" && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={handleConfirmResolution}
                    disabled={confirmingResolution}
                    startIcon={confirmingResolution ? <CircularProgress size={14} color="inherit" /> : null}
                    sx={{ textTransform: "none", fontSize: 12 }}
                  >
                    {confirmingResolution ? "Confirming..." : "✓ Confirm Resolution"}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
          {ticket.assignedToName && (
            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "#7C3AED", fontSize: 13 }}>
                {getInitials(ticket.assignedToName)}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>ASSIGNED TECHNICIAN</Typography>
                <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{ticket.assignedToName}</Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* ── Attachments ── */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", mb: 3 }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 1 }}>
          <AttachFileIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Attachments</Typography>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF", ml: 1 }}>
            (Max 25 MB - Images, PDF, Word, Excel)
          </Typography>
        </Box>

        <Box sx={{ px: 3, py: 3 }}>
          {!isClosed && (
            <Box sx={{ mb: 3 }}>
              <FileUpload
                ticketId={id!}
                onUploadComplete={() => setAttachmentsRefresh((prev) => prev + 1)}
              />
            </Box>
          )}

          <AttachmentsList
            ticketId={id!}
            refreshTrigger={attachmentsRefresh}
            allowDelete={!isClosed}
          />
        </Box>
      </Paper>

      {/* ── Rating (si ticket CLOSED) ── */}
      {isClosed && rating && (
        <Box sx={{ mb: 3 }}>
          <RatingDisplay
            rating={rating.rating}
            comment={rating.comment}
            createdByName={rating.createdByName}
            createdAt={rating.createdAt}
          />
        </Box>
      )}

      {/* ── Bouton Noter (si ticket CLOSED et pas encore noté) ── */}
      {isClosed && !rating && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "#FFFBEB", textAlign: "center" }}>
          <Typography sx={{ fontSize: 14, color: "#92400E", mb: 2, fontWeight: 500 }}>
            Votre ticket a été résolu. Aidez-nous à améliorer notre service en l'évaluant !
          </Typography>
          <Button
            variant="contained"
            color="warning"
            onClick={() => setShowRatingDialog(true)}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            ⭐ Évaluer le service
          </Button>
        </Paper>
      )}

      {/* ── Dialog de notation ── */}
      <RatingDialog
        open={showRatingDialog}
        ticketNumber={ticket.ticketNumber}
        onClose={() => setShowRatingDialog(false)}
        onSubmit={handleSubmitRating}
      />

      {/* ── Conversation ── */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", mb: 3 }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #E5E7EB" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Conversation</Typography>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF", mt: 0.3 }}>Comments and updates from the technician</Typography>
        </Box>

        <Box sx={{ px: 3, py: 2, maxHeight: 400, overflowY: "auto" }}>
          {/* System welcome message */}
          <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#6B7280", fontSize: 12, flexShrink: 0 }}>SY</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827", mb: 0.5 }}>System</Typography>
              <Box sx={{ bgcolor: "#F9FAFB", borderRadius: 1.5, px: 2, py: 1.5, border: "1px solid #E5E7EB" }}>
                <Typography sx={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                  Your ticket has been received and is being processed.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Real comments */}
          {loadingComments ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} sx={{ color: "#2563EB" }} />
            </Box>
          ) : (
            comments.map((comment) => {
              const isMe = comment.authorId === user?.id;
              const isPrivileged = PRIVILEGED_ROLES.includes(comment.authorRole);
              const avatarBg = isMe ? "#2563EB" : isPrivileged ? "#7C3AED" : "#6B7280";
              return (
                <Box key={comment.id} sx={{ display: "flex", gap: 2, mb: 2.5, flexDirection: isMe ? "row-reverse" : "row" }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: avatarBg, fontSize: 12, flexShrink: 0 }}>
                    {getInitials(comment.authorName)}
                  </Avatar>
                  <Box sx={{ flex: 1, maxWidth: "80%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexDirection: isMe ? "row-reverse" : "row" }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                        {isMe ? "You" : `${comment.authorName}${isPrivileged ? " (IT Technician)" : ""}`}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{
                      bgcolor: isMe ? "#EFF6FF" : "#F9FAFB",
                      borderRadius: 1.5, px: 2, py: 1.5,
                      border: `1px solid ${isMe ? "#BFDBFE" : "#E5E7EB"}`,
                    }}>
                      <Typography sx={{ fontSize: 13, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {!isClosed && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 2.5, display: "flex", gap: 2, alignItems: "flex-end" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#2563EB", fontSize: 12, flexShrink: 0, mb: 0.5 }}>
                {userInitials}
              </Avatar>
              <TextField
                fullWidth
                multiline
                minRows={1}
                maxRows={4}
                size="small"
                placeholder="Type your reply…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={sending}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <Button
                variant="contained"
                onClick={handleSend}
                disabled={!reply.trim() || sending}
                sx={{ bgcolor: "#2563EB", textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2.5, mb: 0.5, flexShrink: 0, "&:hover": { bgcolor: "#1D4ED8" } }}
                endIcon={sending ? <CircularProgress size={14} color="inherit" /> : <SendIcon fontSize="small" />}
              >
                Send
              </Button>
            </Box>
          </>
        )}

        {isClosed && (
          <Box sx={{ px: 3, py: 2, bgcolor: "#F9FAFB", borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>
              This ticket is closed — no new comments can be added.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={() => navigate(PATHS.EMPLOYEE_TICKETS)}
        variant="outlined"
        sx={{ textTransform: "none", color: "#6B7280", borderColor: "#E5E7EB", fontWeight: 500, mb: 3, "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" } }}
      >
        Back to My Tickets
      </Button>
    </EmployeeLayout>
  );
}

export default TicketDetailPage;
