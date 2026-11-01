import { Client, LocalAuth, Message } from "whatsapp-web.js";
import QRCode from "qrcode";
import { prisma } from "../../config/database";
import { join } from "path";

// ============================================================================
// Types
// ============================================================================

export interface WhatsAppStatus {
  connected: boolean;
  phoneNumber: string | null;
  qrCode: string | null;
  lastConnectedAt: Date | null;
}

// ============================================================================
// WhatsApp Service (whatsapp-web.js)
// ============================================================================

export class WhatsAppService {
  private client: Client | null = null;
  private qrCode: string | null = null;
  private connected: boolean = false;
  private phoneNumber: string | null = null;
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Démarrer la connexion WhatsApp
   */
  async connect(): Promise<void> {
    if (this.client) {
      console.log("[WhatsApp] Already connected or connecting");
      return;
    }

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: `org-${this.organizationId}`,
        }),
        puppeteer: {
          executablePath: '/usr/bin/chromium-browser',
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--disable-gpu"
          ],
        },
      });

      // QR Code generation
      this.client.on("qr", async (qr: string) => {
        console.log("[WhatsApp] QR Code received");
        this.qrCode = await QRCode.toDataURL(qr);
      });

      // Ready event
      this.client.on("ready", () => {
        console.log("[WhatsApp] Client is ready!");
        this.connected = true;
        this.qrCode = null;
        this.phoneNumber = this.client?.info?.wid?.user || null;
      });

      // Authenticated event
      this.client.on("authenticated", () => {
        console.log("[WhatsApp] Authenticated successfully");
      });

      // Disconnected event
      this.client.on("disconnected", (reason: string) => {
        console.log("[WhatsApp] Disconnected:", reason);
        this.connected = false;
        this.qrCode = null;
        this.client = null;
      });

      // Message received
      this.client.on("message", async (message: Message) => {
        await this.handleIncomingMessage(message);
      });

      // Initialize client
      await this.client.initialize();
      console.log("[WhatsApp] Client initializing...");

    } catch (error) {
      console.error("[WhatsApp] Connection error:", error);
      this.client = null;
      throw error;
    }
  }

  /**
   * Gérer les messages entrants
   */
  private async handleIncomingMessage(message: Message): Promise<void> {
    try {
      // Ignorer les messages envoyés par nous
      if (message.fromMe) return;

      // Ignorer les messages de groupes
      if (message.from.endsWith("@g.us")) return;

      const phoneNumber = message.from.replace("@c.us", "");
      const messageText = message.body;

      console.log(`[WhatsApp] Message from ${phoneNumber}: ${messageText}`);

      // Analyser si c'est un problème IT
      const isITProblem = await this.analyzeMessage(messageText);

      if (!isITProblem) {
        console.log("[WhatsApp] Message is casual conversation, not creating ticket");
        return;
      }

      // Créer ou récupérer le contact
      const contact = await this.getOrCreateContact(phoneNumber);

      // Créer le ticket
      const ticket = await this.createTicketFromMessage(
        contact.id,
        messageText
      );

      // Envoyer confirmation sur WhatsApp
      await this.sendMessage(
        message.from,
        `✅ *Ticket #${ticket.ticketNumber} créé!*\n\n` +
        `Notre équipe IT va vous aider bientôt.\n\n` +
        `*Votre problème:* ${messageText.substring(0, 100)}${messageText.length > 100 ? "..." : ""}`
      );

      console.log(`[WhatsApp] Ticket ${ticket.ticketNumber} created from WhatsApp`);

    } catch (error) {
      console.error("[WhatsApp] Error handling message:", error);
    }
  }

  /**
   * Analyser si le message est un problème IT (AI simple)
   */
  private async analyzeMessage(text: string): Promise<boolean> {
    const textLower = text.toLowerCase();
    const words = text.split(" ");

    // Mots-clés de problèmes IT
    const problemKeywords = [
      "problème", "problem", "erreur", "error", "aide", "help",
      "ne marche pas", "ne fonctionne pas", "doesn't work", "not working",
      "besoin", "need", "bug", "panne", "réparer", "fix", "urgent",
      "bloqué", "stuck", "lent", "slow", "crash", "coupé", "disconnected",
      "impossible", "cannot", "peut pas", "comment", "how to"
    ];

    // Mots-clés de conversation casual
    const casualKeywords = [
      "salut", "hey", "bonjour", "hello", "hi", "coucou",
      "merci", "thanks", "thank you", "ok", "okay", "d'accord",
      "bien", "cool", "super", "génial", "bye", "au revoir",
      "oui", "yes", "non", "no", "peut-être", "maybe"
    ];

    // Messages très courts (<5 mots) + mot casual = pas un problème
    if (words.length < 5) {
      if (casualKeywords.some(k => textLower.includes(k))) {
        return false;
      }
    }

    // Contient mot-clé problème = ticket
    if (problemKeywords.some(k => textLower.includes(k))) {
      return true;
    }

    // Message long (>15 mots) sans mot casual = probablement un problème
    if (words.length > 15 && !casualKeywords.some(k => textLower.includes(k))) {
      return true;
    }

    // Par défaut: pas de ticket (éviter spam)
    return false;
  }

  /**
   * Créer ou récupérer un contact
   */
  private async getOrCreateContact(phoneNumber: string): Promise<any> {
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;

    let contact = await prisma.contact.findUnique({
      where: { phoneNumber: formattedPhone },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          phoneNumber: formattedPhone,
          organizationId: this.organizationId,
          lastMessageAt: new Date(),
        },
      });
      console.log(`[WhatsApp] New contact created: ${formattedPhone}`);
    } else {
      // Update last message time
      await prisma.contact.update({
        where: { id: contact.id },
        data: { lastMessageAt: new Date() },
      });
    }

    return contact;
  }

  /**
   * Créer un ticket depuis un message WhatsApp
   */
  private async createTicketFromMessage(
    contactId: string,
    messageText: string
  ): Promise<any> {
    // Get a default system user to create ticket
    const systemUser = await prisma.user.findFirst({
      where: {
        organizationId: this.organizationId,
        role: { in: ["SUPER_ADMIN", "ADMIN", "TECHNICIAN"] },
      },
    });

    if (!systemUser) {
      throw new Error("No system user found to create ticket");
    }

    // Generate ticket number
    const ticketCount = await prisma.ticket.count({
      where: { organizationId: this.organizationId },
    });
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, "0")}`;

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        subject: `WhatsApp: ${messageText.substring(0, 80)}`,
        description: messageText,
        category: "General IT Support",
        priority: "MEDIUM",
        impact: "INDIVIDUAL",
        source: "WHATSAPP",
        status: "OPEN",
        contactId,
        createdById: systemUser.id,
        organizationId: this.organizationId,
      },
    });

    return ticket;
  }

  /**
   * Envoyer un message WhatsApp
   */
  async sendMessage(to: string, text: string): Promise<void> {
    if (!this.connected || !this.client) {
      throw new Error("WhatsApp not connected");
    }

    try {
      await this.client.sendMessage(to, text);
      console.log(`[WhatsApp] Message sent to ${to}`);
    } catch (error) {
      console.error("[WhatsApp] Error sending message:", error);
      throw error;
    }
  }

  /**
   * Obtenir le statut de la connexion
   */
  getStatus(): WhatsAppStatus {
    return {
      connected: this.connected,
      phoneNumber: this.phoneNumber,
      qrCode: this.qrCode,
      lastConnectedAt: this.connected ? new Date() : null,
    };
  }

  /**
   * Déconnecter WhatsApp
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.connected = false;
      this.qrCode = null;
      this.phoneNumber = null;
      console.log("[WhatsApp] Disconnected");
    }
  }
}

// Instance globale (une par organisation - pour simplifier on utilise une seule)
let whatsappInstance: WhatsAppService | null = null;

export function getWhatsAppInstance(organizationId: string): WhatsAppService {
  if (!whatsappInstance) {
    whatsappInstance = new WhatsAppService(organizationId);
  }
  return whatsappInstance;
}
