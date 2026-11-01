import { Request, Response, NextFunction } from "express";
import { getWhatsAppInstance } from "./whatsapp.service";
import { ApiError } from "../../middlewares/error.middleware";

export class WhatsAppController {
  /**
   * GET /api/v1/whatsapp/status
   * Obtenir le statut de la connexion WhatsApp
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new ApiError(401, "Organization not found");
      }

      const whatsapp = getWhatsAppInstance(organizationId);
      const status = whatsapp.getStatus();

      res.json({
        success: true,
        message: "WhatsApp status retrieved",
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/whatsapp/connect
   * Démarrer la connexion WhatsApp (génère QR Code)
   */
  async connect(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new ApiError(401, "Organization not found");
      }

      const whatsapp = getWhatsAppInstance(organizationId);
      
      // Start connection in background
      whatsapp.connect().catch(err => {
        console.error("[WhatsApp] Connection error:", err);
      });

      // Wait a bit for QR code generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const status = whatsapp.getStatus();

      res.json({
        success: true,
        message: "WhatsApp connection started. Scan QR code to continue.",
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/whatsapp/disconnect
   * Déconnecter WhatsApp
   */
  async disconnect(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new ApiError(401, "Organization not found");
      }

      const whatsapp = getWhatsAppInstance(organizationId);
      await whatsapp.disconnect();

      res.json({
        success: true,
        message: "WhatsApp disconnected successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/whatsapp/send
   * Envoyer un message WhatsApp
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new ApiError(401, "Organization not found");
      }

      const { phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        throw new ApiError(400, "Phone number and message are required");
      }

      const whatsapp = getWhatsAppInstance(organizationId);
      const formattedPhone = phoneNumber.includes("@")
        ? phoneNumber
        : `${phoneNumber}@s.whatsapp.net`;

      await whatsapp.sendMessage(formattedPhone, message);

      res.json({
        success: true,
        message: "Message sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/whatsapp/contacts
   * Obtenir la liste des contacts WhatsApp
   */
  async getContacts(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) {
        throw new ApiError(401, "Organization not found");
      }

      const { prisma } = await import("../../config/database");

      const contacts = await prisma.contact.findMany({
        where: { organizationId },
        include: {
          _count: {
            select: { tickets: true },
          },
        },
        orderBy: { lastMessageAt: "desc" },
      });

      res.json({
        success: true,
        message: "Contacts retrieved successfully",
        data: contacts,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const whatsappController = new WhatsAppController();
