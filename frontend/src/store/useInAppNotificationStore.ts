import { create } from "zustand";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  type ApiNotification,
} from "../services/notifications.service";

export type InAppNotifType =
  | "TICKET_CREATED"
  | "TICKET_UPDATED"
  | "TICKET_ASSIGNED"
  | "TICKET_RESOLVED"
  | "TICKET_CLOSED"
  | "SYSTEM_INFO"
  | "SYSTEM_WARNING"
  | "SLA_BREACH";

export type InAppNotification = ApiNotification;

interface InAppNotificationState {
  notifications: InAppNotification[];
  unreadCount: number;
  loading: boolean;
  initialized: boolean;

  /** Fetch all notifications from the API. */
  load: () => Promise<void>;

  /** Mark one as read (API + local state). */
  markAsRead: (id: string) => Promise<void>;

  /** Mark all as read (API + local state). */
  markAllAsRead: () => Promise<void>;

  /** Delete one notification (API + local state). */
  remove: (id: string) => Promise<void>;

  /** Delete all notifications (API + local state). */
  clearAll: () => Promise<void>;
}

/**
 * Store Zustand pour les notifications in-app.
 * Connecté au backend — plus de mock data.
 */
export const useInAppNotificationStore = create<InAppNotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  initialized: false,

  load: async () => {
    // Avoid double-fetch if already loading
    if (get().loading) return;
    set({ loading: true });
    try {
      const result = await fetchNotifications();
      set({
        notifications: result.notifications,
        unreadCount: result.unreadCount,
        initialized: true,
      });
    } catch {
      // Silent fail — user may not be logged in yet
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    try {
      await markNotificationAsRead(id);
    } catch {
      // Revert on failure by re-fetching
      get().load();
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    const prev = get().notifications;
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        read: true,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
    try {
      await markAllNotificationsAsRead();
    } catch {
      set({ notifications: prev });
      get().load();
    }
  },

  remove: async (id) => {
    const prev = get().notifications;
    const target = prev.find((n) => n.id === id);
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: target && !target.read
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }));
    try {
      await deleteNotification(id);
    } catch {
      set({ notifications: prev });
    }
  },

  clearAll: async () => {
    const prev = get().notifications;
    // Optimistic update
    set({ notifications: [], unreadCount: 0 });
    try {
      await deleteAllNotifications();
    } catch {
      set({ notifications: prev });
      get().load();
    }
  },
}));
