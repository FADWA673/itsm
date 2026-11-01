import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import type {
  NotificationResponse,
  CreateNotificationRequest,
  NotificationsListResponse,
} from "./notifications.types";

function formatNotification(n: {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: Date | null;
  ticketId: string | null;
  createdAt: Date;
}): NotificationResponse {
  return {
    id: n.id,
    type: n.type as NotificationResponse["type"],
    title: n.title,
    message: n.message,
    read: n.read,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    ticketId: n.ticketId,
    createdAt: n.createdAt.toISOString(),
  };
}

export class NotificationsService {
  /**
   * Récupère toutes les notifications d'un utilisateur.
   * Les plus récentes en premier.
   */
  async findByUser(userId: string): Promise<NotificationsListResponse> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      notifications: notifications.map(formatNotification),
      unreadCount,
      total: notifications.length,
    };
  }

  /**
   * Marque une notification comme lue.
   * Vérifie que la notification appartient bien à l'utilisateur.
   */
  async markAsRead(id: string, userId: string): Promise<NotificationResponse> {
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Notification not found");
    if (existing.userId !== userId) throw new ApiError(403, "Access denied");

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
    return formatNotification(updated);
  }

  /**
   * Marque toutes les notifications de l'utilisateur comme lues.
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { count: result.count };
  }

  /**
   * Supprime une notification.
   */
  async delete(id: string, userId: string): Promise<void> {
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Notification not found");
    if (existing.userId !== userId) throw new ApiError(403, "Access denied");
    await prisma.notification.delete({ where: { id } });
  }

  /**
   * Supprime toutes les notifications d'un utilisateur.
   */
  async deleteAll(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.deleteMany({ where: { userId } });
    return { count: result.count };
  }

  /**
   * Crée une notification (appelé en interne depuis d'autres services).
   * Ex: après création d'un ticket, assignation, résolution…
   */
  async create(data: CreateNotificationRequest): Promise<NotificationResponse> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        ...(data.ticketId && { ticketId: data.ticketId }),
      },
    });
    return formatNotification(notification);
  }

  /**
   * Retourne le nombre de notifications non lues.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, read: false } });
  }
}

export const notificationsService = new NotificationsService();
