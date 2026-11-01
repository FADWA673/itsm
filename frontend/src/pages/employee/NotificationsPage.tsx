import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EmployeeLayout from "../../layouts/EmployeeLayout";
import { useInAppNotificationStore, useNotificationStore } from "../../store";
import type { InAppNotifType } from "../../store/useInAppNotificationStore";

// ─── Icon map per notification type ──────────────────────────────────────────

const TYPE_CONFIG: Record<
  InAppNotifType,
  { icon: React.ReactNode; iconBg: string; iconColor: string }
> = {
  TICKET_CREATED: { icon: <ConfirmationNumberIcon fontSize="small" />, iconBg: "#ECFDF5", iconColor: "#059669" },
  TICKET_UPDATED: { icon: <ConfirmationNumberIcon fontSize="small" />, iconBg: "#EFF6FF", iconColor: "#2563EB" },
  TICKET_ASSIGNED: { icon: <ConfirmationNumberIcon fontSize="small" />, iconBg: "#EFF6FF", iconColor: "#2563EB" },
  TICKET_RESOLVED: { icon: <CheckCircleIcon fontSize="small" />, iconBg: "#ECFDF5", iconColor: "#059669" },
  TICKET_CLOSED: { icon: <CheckCircleIcon fontSize="small" />, iconBg: "#F3F4F6", iconColor: "#6B7280" },
  SYSTEM_INFO: { icon: <InfoIcon fontSize="small" />, iconBg: "#EFF6FF", iconColor: "#2563EB" },
  SYSTEM_WARNING: { icon: <WarningIcon fontSize="small" />, iconBg: "#FFFBEB", iconColor: "#D97706" },
  SLA_BREACH: { icon: <WarningIcon fontSize="small" />, iconBg: "#FEF2F2", iconColor: "#DC2626" },
};

/** Formats ISO date string to relative time label */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

// ─── Component ────────────────────────────────────────────────────────────────

function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    load,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  } = useInAppNotificationStore();
  const { addNotification } = useNotificationStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Load on mount
  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    addNotification("All notifications marked as read", "success");
  };

  const handleClearAll = async () => {
    await clearAll();
    addNotification("All notifications cleared", "info");
  };

  return (
    <EmployeeLayout>
      {/* ── Header ── */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white" }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
              Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5 }}>
              {loading
                ? "Loading…"
                : unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All notifications read"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {notifications.length > 0 && (
              <Tooltip title="Clear all">
                <IconButton
                  size="small"
                  onClick={handleClearAll}
                  sx={{ color: "#9CA3AF", "&:hover": { color: "#EF4444" } }}
                >
                  <NotificationsOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon fontSize="small" />}
                onClick={handleMarkAllRead}
                sx={{ textTransform: "none", color: "#2563EB", fontWeight: 600 }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
        </Box>

        {/* Filter tabs */}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          {(["all", "unread"] as const).map((f) => (
            <Button
              key={f}
              size="small"
              variant={filter === f ? "contained" : "outlined"}
              onClick={() => setFilter(f)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 12,
                borderRadius: 5,
                px: 2,
                ...(filter === f
                  ? { bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }
                  : { borderColor: "#E5E7EB", color: "#6B7280" }),
              }}
            >
              {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* ── List ── */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "white", overflow: "hidden" }}
      >
        {loading ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={32} sx={{ color: "#2563EB" }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <NotificationsIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
            <Typography sx={{ color: "#6B7280", fontWeight: 500 }}>
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: 13, mt: 0.5 }}>
              {filter === "all" && "Notifications will appear here when tickets are updated."}
            </Typography>
          </Box>
        ) : (
          filtered.map((notif, i) => {
            const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.SYSTEM_INFO;
            return (
              <Box key={notif.id}>
                <Box
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    px: 3,
                    py: 2.5,
                    bgcolor: notif.read ? "white" : "#F8FAFF",
                    cursor: notif.read ? "default" : "pointer",
                    "&:hover": { bgcolor: "#F9FAFB" },
                    position: "relative",
                    transition: "background-color 0.15s",
                  }}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: "#2563EB",
                      }}
                    />
                  )}

                  {/* Icon */}
                  <Avatar sx={{ width: 40, height: 40, bgcolor: cfg.iconBg, flexShrink: 0 }}>
                    <Box sx={{ color: cfg.iconColor }}>{cfg.icon}</Box>
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography sx={{ fontSize: 14, fontWeight: notif.read ? 500 : 700, color: "#111827" }}>
                        {notif.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0, ml: 2 }}>
                        <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
                          {timeAgo(notif.createdAt)}
                        </Typography>
                        {!notif.read && (
                          <Chip
                            label="New"
                            size="small"
                            sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: 10, height: 18 }}
                          />
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); remove(notif.id); }}
                            sx={{ color: "#D1D5DB", ml: 0.5, "&:hover": { color: "#EF4444" }, width: 22, height: 22 }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: "#6B7280", mt: 0.5, lineHeight: 1.5 }}>
                      {notif.message}
                    </Typography>
                  </Box>
                </Box>
                {i < filtered.length - 1 && <Divider sx={{ mx: 3 }} />}
              </Box>
            );
          })
        )}
      </Paper>
    </EmployeeLayout>
  );
}

export default NotificationsPage;
