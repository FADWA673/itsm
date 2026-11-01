import { get, patch, del } from "./api";

export type NotificationType =
  | "TICKET_CREATED"
  | "TICKET_UPDATED"
  | "TICKET_ASSIGNED"
  | "TICKET_RESOLVED"
  | "TICKET_CLOSED"
  | "SYSTEM_INFO"
  | "SYSTEM_WARNING"
  | "SLA_BREACH";

export interface ApiNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  ticketId: string | null;
  createdAt: string;
}

export interface NotificationsListResponse {
  notifications: ApiNotification[];
  unreadCount: number;
  total: number;
}

/**
 * GET /api/v1/notifications
 */
export async function fetchNotifications(): Promise<NotificationsListResponse> {
  return get<NotificationsListResponse>("/notifications");
}

/**
 * GET /api/v1/notifications/unread-count
 */
export async function fetchUnreadCount(): Promise<number> {
  const data = await get<{ count: number }>("/notifications/unread-count");
  return data.count;
}

/**
 * PATCH /api/v1/notifications/:id/read
 */
export async function markNotificationAsRead(id: string): Promise<ApiNotification> {
  return patch<ApiNotification>(`/notifications/${id}/read`);
}

/**
 * PATCH /api/v1/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  return patch<{ count: number }>("/notifications/read-all");
}

/**
 * DELETE /api/v1/notifications/:id
 */
export async function deleteNotification(id: string): Promise<void> {
  await del(`/notifications/${id}`);
}

/**
 * DELETE /api/v1/notifications
 */
export async function deleteAllNotifications(): Promise<{ count: number }> {
  return del<{ count: number }>("/notifications");
}
