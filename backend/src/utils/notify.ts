import { notificationsService } from "../modules/notifications/notifications.service";
import type { NotificationType } from "../modules/notifications/notifications.types";
import { logger } from "./logger";

/**
 * Crée une notification in-app sans bloquer le flux principal.
 * Les erreurs sont logguées mais ne font pas échouer l'opération.
 *
 * Usage :
 *   await notify(userId, "TICKET_CREATED", "Ticket created", "Your ticket INC-2026-000001 has been created.", ticketId)
 */
export async function notify(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  ticketId?: string
): Promise<void> {
  try {
    await notificationsService.create({ userId, type, title, message, ticketId });
  } catch (err) {
    logger.error(`Failed to create notification for user ${userId}: ${String(err)}`);
  }
}
