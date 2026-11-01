import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "./notifications.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All notification routes require authentication — no admin restriction,
// each user can only access their own notifications (enforced in service layer).
router.use(authenticate);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/", deleteAllNotifications);
router.delete("/:id", deleteNotification);

export default router;
