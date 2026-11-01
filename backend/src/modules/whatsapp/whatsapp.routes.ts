import { Router } from "express";
import { whatsappController } from "./whatsapp.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

// All WhatsApp routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/whatsapp/status
 * Get WhatsApp connection status
 */
router.get("/status", whatsappController.getStatus.bind(whatsappController));

/**
 * POST /api/v1/whatsapp/connect
 * Start WhatsApp connection (generates QR code)
 */
router.post("/connect", whatsappController.connect.bind(whatsappController));

/**
 * POST /api/v1/whatsapp/disconnect
 * Disconnect WhatsApp
 */
router.post("/disconnect", whatsappController.disconnect.bind(whatsappController));

/**
 * POST /api/v1/whatsapp/send
 * Send WhatsApp message
 */
router.post("/send", whatsappController.sendMessage.bind(whatsappController));

/**
 * GET /api/v1/whatsapp/contacts
 * Get all WhatsApp contacts
 */
router.get("/contacts", whatsappController.getContacts.bind(whatsappController));

export default router;
