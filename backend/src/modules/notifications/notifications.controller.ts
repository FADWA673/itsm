import { Request, Response } from "express";
import { notificationsService } from "./notifications.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";

/**
 * GET /notifications
 * Récupère toutes les notifications de l'utilisateur connecté.
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const result = await notificationsService.findByUser(req.user.id);
  res.json({
    success: true,
    message: "Notifications retrieved",
    data: result,
  });
});

/**
 * GET /notifications/unread-count
 * Retourne uniquement le nombre de notifications non lues (polling léger).
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const count = await notificationsService.getUnreadCount(req.user.id);
  res.json({ success: true, message: "Unread count", data: { count } });
});

/**
 * PATCH /notifications/:id/read
 * Marque une notification comme lue.
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  const notification = await notificationsService.markAsRead(id, req.user.id);
  res.json({ success: true, message: "Notification marked as read", data: notification });
});

/**
 * PATCH /notifications/read-all
 * Marque toutes les notifications comme lues.
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const result = await notificationsService.markAllAsRead(req.user.id);
  res.json({ success: true, message: `${result.count} notifications marked as read`, data: result });
});

/**
 * DELETE /notifications/:id
 * Supprime une notification.
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const id = req.params["id"] as string;
  await notificationsService.delete(id, req.user.id);
  res.json({ success: true, message: "Notification deleted" });
});

/**
 * DELETE /notifications
 * Supprime toutes les notifications de l'utilisateur.
 */
export const deleteAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const result = await notificationsService.deleteAll(req.user.id);
  res.json({ success: true, message: `${result.count} notifications deleted`, data: result });
});
