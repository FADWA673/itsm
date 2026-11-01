import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE_URL}/api/v1/whatsapp-meta`;

// Types
export interface WhatsAppMetaStatus {
  configured: boolean;
  phoneNumberId?: string;
  businessAccountId?: string;
  webhookConfigured: boolean;
  lastError?: string;
  messagesCount?: number;
  webhooksCount?: number;
}

export interface WhatsAppMetaStats {
  totalMessagesSent: number;
  totalMessagesReceived: number;
  totalTicketsCreated: number;
  totalContacts: number;
  lastMessageDate?: string;
  errorCount: number;
}

export interface SendMessageRequest {
  to: string;
  message: string;
}

export interface SendTemplateRequest {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: any[];
}

export interface SendMediaRequest {
  to: string;
  mediaType: 'image' | 'document' | 'audio' | 'video';
  mediaUrl: string;
  caption?: string;
  filename?: string;
}

export interface WhatsAppContact {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  lastMessageAt?: string;
  isBlocked: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class WhatsAppMetaService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  /**
   * Obtenir le statut du service Meta
   */
  async getStatus(): Promise<WhatsAppMetaStatus> {
    const response = await axios.get(`${API_URL}/status`, this.getAuthHeader());
    return response.data;
  }

  /**
   * Obtenir les statistiques
   */
  async getStats(): Promise<WhatsAppMetaStats> {
    const response = await axios.get(`${API_URL}/stats`, this.getAuthHeader());
    return response.data;
  }

  /**
   * Envoyer un message texte
   */
  async sendMessage(request: SendMessageRequest): Promise<ApiResponse> {
    const response = await axios.post(`${API_URL}/send`, request, this.getAuthHeader());
    return response.data;
  }

  /**
   * Envoyer un message template
   */
  async sendTemplate(request: SendTemplateRequest): Promise<ApiResponse> {
    const response = await axios.post(`${API_URL}/send-template`, request, this.getAuthHeader());
    return response.data;
  }

  /**
   * Envoyer un média
   */
  async sendMedia(request: SendMediaRequest): Promise<ApiResponse> {
    const response = await axios.post(`${API_URL}/send-media`, request, this.getAuthHeader());
    return response.data;
  }

  /**
   * Tester l'envoi d'un message
   */
  async testSend(phoneNumber: string): Promise<ApiResponse> {
    const response = await axios.post(
      `${API_URL}/test`,
      { phoneNumber },
      this.getAuthHeader()
    );
    return response.data;
  }

  /**
   * Obtenir la liste des contacts
   */
  async getContacts(): Promise<WhatsAppContact[]> {
    const response = await axios.get(`${API_URL}/contacts`, this.getAuthHeader());
    return response.data;
  }

  /**
   * Obtenir un contact par ID
   */
  async getContactById(id: string): Promise<WhatsAppContact> {
    const response = await axios.get(`${API_URL}/contacts/${id}`, this.getAuthHeader());
    return response.data;
  }

  /**
   * Bloquer/débloquer un contact
   */
  async toggleBlockContact(id: string): Promise<ApiResponse<WhatsAppContact>> {
    const response = await axios.put(
      `${API_URL}/contacts/${id}/toggle-block`,
      {},
      this.getAuthHeader()
    );
    return response.data;
  }

  /**
   * Mettre à jour la configuration
   */
  async updateConfig(config: Record<string, any>): Promise<ApiResponse> {
    const response = await axios.put(`${API_URL}/config`, config, this.getAuthHeader());
    return response.data;
  }

  /**
   * Formater un numéro de téléphone pour WhatsApp
   */
  formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Si le numéro commence par 00, le remplacer par +
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2);
    }

    // Si le numéro ne commence pas par +, ajouter +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Valider un numéro de téléphone
   */
  isValidPhoneNumber(phone: string): boolean {
    const cleaned = this.formatPhoneNumber(phone);
    // Vérifier que le numéro commence par + et contient entre 10 et 15 chiffres
    return /^\+\d{10,15}$/.test(cleaned);
  }
}

export const whatsAppMetaService = new WhatsAppMetaService();
export default whatsAppMetaService;
