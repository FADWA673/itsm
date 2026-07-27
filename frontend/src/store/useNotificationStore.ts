import { create } from "zustand";

export type NotificationSeverity = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  message: string;
  severity: NotificationSeverity;
  autoHideDuration?: number; // ms, null = ne se ferme pas automatiquement
}

interface NotificationState {
  notifications: Notification[];

  /**
   * Ajoute une notification.
   * @returns l'id de la notification créée
   */
  addNotification: (
    message: string,
    severity?: NotificationSeverity,
    autoHideDuration?: number
  ) => string;

  /** Supprime une notification par son id. */
  removeNotification: (id: string) => void;

  /** Supprime toutes les notifications. */
  clearAll: () => void;
}

/**
 * Store Zustand pour les notifications/toasts.
 * Utilisé avec un composant NotificationProvider (ITSM-003-8).
 *
 * Usage :
 *   const { addNotification } = useNotificationStore()
 *   addNotification("Ticket créé avec succès", "success")
 *   addNotification("Erreur de connexion", "error")
 */
export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  addNotification: (message, severity = "info", autoHideDuration = 4000) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, message, severity, autoHideDuration },
      ],
    }));
    return id;
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));
