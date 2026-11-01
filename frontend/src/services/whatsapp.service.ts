import { apiClient } from "./api";

// ============================================================================
// Types
// ============================================================================

export interface WhatsAppStatus {
  connected: boolean;
  phoneNumber: string | null;
  qrCode: string | null;
  lastConnectedAt: Date | null;
}

export interface Contact {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  lastMessageAt: Date | null;
  isBlocked: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    tickets: number;
  };
}

// ============================================================================
// WhatsApp Service
// ============================================================================

class WhatsAppService {
  /**
   * Get WhatsApp connection status
   */
  async getStatus(): Promise<WhatsAppStatus> {
    const response = await apiClient.get("/whatsapp/status");
    return response.data.data;
  }

  /**
   * Start WhatsApp connection (generates QR code)
   */
  async connect(): Promise<WhatsAppStatus> {
    const response = await apiClient.post("/whatsapp/connect");
    return response.data.data;
  }

  /**
   * Disconnect WhatsApp
   */
  async disconnect(): Promise<void> {
    await apiClient.post("/whatsapp/disconnect");
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    await apiClient.post("/whatsapp/send", { phoneNumber, message });
  }

  /**
   * Get all WhatsApp contacts
   */
  async getContacts(): Promise<Contact[]> {
    const response = await apiClient.get("/whatsapp/contacts");
    return response.data.data;
  }
}

export const whatsappService = new WhatsAppService();
