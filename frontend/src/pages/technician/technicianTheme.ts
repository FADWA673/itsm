import type { TicketDTO } from "../../services/tickets.service";

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#EFF6FF", text: "#2563EB" },
  IN_PROGRESS: { bg: "#FEF3C7", text: "#D97706" },
  WAITING_FOR_USER: { bg: "#F3E8FF", text: "#7C3AED" },
  RESOLVED: { bg: "#ECFDF5", text: "#059669" },
  CLOSED: { bg: "#F3F4F6", text: "#6B7280" },
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  HIGH: { bg: "#FEE2E2", text: "#DC2626" },
  MEDIUM: { bg: "#FEF3C7", text: "#D97706" },
  LOW: { bg: "#ECFDF5", text: "#059669" },
  CRITICAL: { bg: "#FDF2F8", text: "#9D174D" },
};

export const cardSx = {
  elevation: 0,
  borderRadius: 2,
  border: "1px solid #E5E7EB",
  bgcolor: "white",
} as const;

export function formatSlaRemaining(ticket: TicketDTO) {
  const hoursMap: Record<string, number> = { CRITICAL: 1, HIGH: 4, MEDIUM: 8, LOW: 24 };
  const slaHours = hoursMap[ticket.priority] ?? 8;
  const elapsed = (Date.now() - new Date(ticket.createdAt).getTime()) / 3600000;
  const remaining = Math.max(0, slaHours - elapsed);
  const h = Math.floor(remaining);
  const m = Math.round((remaining - h) * 60);
  return `${h}h ${m}m`;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
