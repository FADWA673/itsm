import { Router } from "express";
import healthRouter from "./health.routes";
import authRouter from "../../modules/auth/auth.routes";
import usersRouter from "../../modules/users/users.routes";
import ticketsRouter from "../../modules/tickets/tickets.routes";
import ratingsRouter from "../../modules/tickets/ratings.routes";
import notificationsRouter from "../../modules/notifications/notifications.routes";
import attachmentsRouter from "../../modules/attachments/attachments.routes";
import assetsRouter from "../../modules/assets/assets.routes";
import knowledgeBaseRouter from "../../modules/knowledge-base/kb.routes";
import aiRouter from "../../modules/ai/ai.routes";
import whatsappRouter from "../../modules/whatsapp/whatsapp.routes";
import whatsappMetaRouter from "../../modules/whatsapp-meta/whatsapp-meta.routes";
import slaRouter from "../../modules/sla/sla.routes";
import ticketCategoriesRouter from "../../modules/ticket-categories/categories.routes";
import statisticsRouter from "../../modules/statistics/statistics.routes";
import aiEnhancedRouter from "../../modules/ai/ai-enhanced.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/tickets", ticketsRouter);
router.use("/ratings", ratingsRouter);
router.use("/notifications", notificationsRouter);
router.use("/assets", assetsRouter);
router.use("/kb", knowledgeBaseRouter);
router.use("/ai", aiRouter);
router.use("/whatsapp", whatsappRouter);
router.use("/whatsapp-meta", whatsappMetaRouter);
router.use("/sla", slaRouter); // ✅ Routes SLA
router.use("/ticket-categories", ticketCategoriesRouter); // ✅ Routes Categories
router.use("/statistics", statisticsRouter); // ✅ Routes Statistics
router.use("/ai", aiEnhancedRouter); // ✅ Routes AI Enhanced
router.use("/", attachmentsRouter); // Routes: /tickets/:id/attachments et /attachments/:id/download

export default router;
