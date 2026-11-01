import axios, { AxiosError } from 'axios';
import { PrismaClient, TicketSource, TicketPriority, TicketStatus } from '@prisma/client';
import crypto from 'crypto';
import {
  WhatsAppMetaConfig,
  SendMessageRequest,
  SendTemplateRequest,
  SendMediaRequest,
  MetaWebhookPayload,
  GraphApiResponse,
  GraphApiError,
  WhatsAppMetaStatus,
  WhatsAppMetaStats,
  WhatsAppContact,
  WebhookMessage,
} from './whatsapp-meta.types';

const prisma = new PrismaClient();

class WhatsAppMetaService {
  private config: WhatsAppMetaConfig;
  private baseUrl: string;
  private messagesSentCount: number = 0;
  private messagesReceivedCount: number = 0;
  private ticketsCreatedCount: number = 0;
  private errorCount: number = 0;

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_META_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_META_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_META_BUSINESS_ACCOUNT_ID || '',
      verifyToken: process.env.WHATSAPP_META_VERIFY_TOKEN || '',
      graphApiVersion: process.env.WHATSAPP_META_GRAPH_API_VERSION || 'v18.0',
    };

    this.baseUrl = `https://graph.facebook.com/${this.config.graphApiVersion}`;
  }

  /**
   * Vérifier si le service est correctement configuré
   */
  isConfigured(): boolean {
    return !!(
      this.config.accessToken &&
      this.config.phoneNumberId &&
      this.config.businessAccountId &&
      this.config.verifyToken
    );
  }

  /**
   * Obtenir le statut du service
   */
  async getStatus(): Promise<WhatsAppMetaStatus> {
    try {
      if (!this.isConfigured()) {
        return {
          configured: false,
          webhookConfigured: false,
          lastError: 'Configuration incomplète - vérifiez les variables d\'environnement',
        };
      }

      // Tester la connexion à l'API Graph
      const response = await axios.get(
        `${this.baseUrl}/${this.config.phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
          },
        }
      );

      return {
        configured: true,
        phoneNumberId: this.config.phoneNumberId,
        businessAccountId: this.config.businessAccountId,
        webhookConfigured: true,
        messagesCount: this.messagesSentCount,
        webhooksCount: this.messagesReceivedCount,
      };
    } catch (error) {
      this.errorCount++;
      return {
        configured: true,
        phoneNumberId: this.config.phoneNumberId,
        businessAccountId: this.config.businessAccountId,
        webhookConfigured: false,
        lastError: this.getErrorMessage(error),
        messagesCount: this.messagesSentCount,
        webhooksCount: this.messagesReceivedCount,
      };
    }
  }

  /**
   * Obtenir les statistiques
   */
  async getStats(): Promise<WhatsAppMetaStats> {
    const totalContacts = await prisma.contact.count();
    const lastContact = await prisma.contact.findFirst({
      orderBy: { lastMessageAt: 'desc' },
    });

    return {
      totalMessagesSent: this.messagesSentCount,
      totalMessagesReceived: this.messagesReceivedCount,
      totalTicketsCreated: this.ticketsCreatedCount,
      totalContacts,
      lastMessageDate: lastContact?.lastMessageAt || undefined,
      errorCount: this.errorCount,
    };
  }

  /**
   * Envoyer un message texte
   */
  async sendMessage(request: SendMessageRequest): Promise<GraphApiResponse> {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp Meta API n\'est pas configuré');
    }

    try {
      // Nettoyer le numéro de téléphone
      const cleanPhone = this.cleanPhoneNumber(request.to);

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: request.message,
        },
      };

      const response = await axios.post<GraphApiResponse>(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.messagesSentCount++;
      console.log('✅ Message envoyé via Meta API:', response.data);

      // Mettre à jour le contact
      await this.updateOrCreateContact(cleanPhone, undefined);

      return response.data;
    } catch (error) {
      this.errorCount++;
      console.error('❌ Erreur lors de l\'envoi du message Meta:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Envoyer un message template
   */
  async sendTemplate(request: SendTemplateRequest): Promise<GraphApiResponse> {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp Meta API n\'est pas configuré');
    }

    try {
      const cleanPhone = this.cleanPhoneNumber(request.to);

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: request.templateName,
          language: {
            code: request.languageCode || 'fr',
          },
          components: request.components || [],
        },
      };

      const response = await axios.post<GraphApiResponse>(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.messagesSentCount++;
      console.log('✅ Template envoyé via Meta API:', response.data);

      await this.updateOrCreateContact(cleanPhone, undefined);

      return response.data;
    } catch (error) {
      this.errorCount++;
      console.error('❌ Erreur lors de l\'envoi du template Meta:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Envoyer un média (image, document, etc.)
   */
  async sendMedia(request: SendMediaRequest): Promise<GraphApiResponse> {
    if (!this.isConfigured()) {
      throw new Error('WhatsApp Meta API n\'est pas configuré');
    }

    try {
      const cleanPhone = this.cleanPhoneNumber(request.to);

      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: request.mediaType,
      };

      // Configurer le média selon le type
      payload[request.mediaType] = {
        link: request.mediaUrl,
      };

      if (request.caption) {
        payload[request.mediaType].caption = request.caption;
      }

      if (request.filename && request.mediaType === 'document') {
        payload[request.mediaType].filename = request.filename;
      }

      const response = await axios.post<GraphApiResponse>(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.messagesSentCount++;
      console.log('✅ Média envoyé via Meta API:', response.data);

      await this.updateOrCreateContact(cleanPhone, undefined);

      return response.data;
    } catch (error) {
      this.errorCount++;
      console.error('❌ Erreur lors de l\'envoi du média Meta:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Vérifier le webhook (GET request de Meta)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.verifyToken) {
      console.log('✅ Webhook vérifié avec succès');
      return challenge;
    } else {
      console.error('❌ Échec de la vérification du webhook');
      return null;
    }
  }

  /**
   * Traiter un webhook (POST request de Meta)
   */
  async processWebhook(payload: MetaWebhookPayload): Promise<void> {
    try {
      console.log('📥 Webhook reçu:', JSON.stringify(payload, null, 2));

      if (payload.object !== 'whatsapp_business_account') {
        console.log('⚠️ Type de webhook non pris en charge:', payload.object);
        return;
      }

      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await this.handleMessagesChange(change.value);
          }
        }
      }
    } catch (error) {
      this.errorCount++;
      console.error('❌ Erreur lors du traitement du webhook:', error);
      throw error;
    }
  }

  /**
   * Gérer les changements de messages
   */
  private async handleMessagesChange(value: any): Promise<void> {
    const { messages, contacts } = value;

    if (!messages || messages.length === 0) {
      console.log('⚠️ Aucun message dans le webhook');
      return;
    }

    for (const message of messages) {
      this.messagesReceivedCount++;

      // Obtenir les informations du contact
      const contactInfo = contacts?.find((c: any) => c.wa_id === message.from);
      const contactName = contactInfo?.profile?.name || 'Utilisateur WhatsApp';

      console.log(`📩 Message reçu de ${contactName} (${message.from})`);

      // Mettre à jour ou créer le contact
      const contact = await this.updateOrCreateContact(message.from, contactName);

      // Extraire le contenu du message selon le type
      const messageContent = this.extractMessageContent(message);

      // Vérifier si le message doit créer un ticket (AI filtering)
      if (this.shouldCreateTicket(messageContent)) {
        await this.createTicketFromMessage(contact.id, contactName, messageContent, message);
        this.ticketsCreatedCount++;
      } else {
        console.log('⚠️ Message ignoré (pas de mots-clés détectés):', messageContent);
      }
    }
  }

  /**
   * Extraire le contenu du message selon son type
   */
  private extractMessageContent(message: WebhookMessage): string {
    switch (message.type) {
      case 'text':
        return message.text?.body || '';
      case 'image':
        return `[Image] ${message.image?.caption || 'Image envoyée'}`;
      case 'document':
        return `[Document] ${message.document?.filename || 'Document envoyé'}`;
      case 'audio':
        return '[Audio] Message vocal envoyé';
      case 'video':
        return `[Video] ${message.video?.caption || 'Vidéo envoyée'}`;
      case 'location':
        return '[Location] Localisation envoyée';
      case 'contacts':
        return '[Contacts] Contacts partagés';
      default:
        return '[Message] Type de message non pris en charge';
    }
  }

  /**
   * Vérifier si un message doit créer un ticket (AI filtering)
   */
  private shouldCreateTicket(message: string): boolean {
    const keywords = [
      // Problèmes techniques
      'problème', 'problem', 'bug', 'erreur', 'error', 'panne', 'ne fonctionne pas',
      'ne marche pas', 'ça marche pas', 'bloqué', 'planté',
      
      // Demandes d'aide
      'aide', 'help', 'besoin', 'urgent', 'assistance', 'support',
      'comment', 'pourquoi', 'question',
      
      // Actions
      'réparation', 'réparer', 'fix', 'corriger', 'résoudre',
      
      // Incidents
      'incident', 'coupure', 'interruption', 'indisponible',
      
      // Demandes de service
      'demande', 'request', 'installation', 'configurer',
      'accès', 'compte', 'mot de passe', 'password',
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Créer un ticket depuis un message WhatsApp
   */
  private async createTicketFromMessage(
    contactId: string,
    contactName: string,
    messageContent: string,
    originalMessage: WebhookMessage
  ): Promise<void> {
    try {
      // Déterminer la priorité basée sur les mots-clés
      let priority = TicketPriority.MEDIUM;
      const lowerMessage = messageContent.toLowerCase();

      if (lowerMessage.includes('urgent') || lowerMessage.includes('critique')) {
        priority = TicketPriority.HIGH;
      } else if (lowerMessage.includes('bloqué') || lowerMessage.includes('panne')) {
        priority = TicketPriority.HIGH;
      }

      // Générer un titre basé sur le contenu
      const title = this.generateTicketTitle(messageContent);

      // Récupérer le contact pour avoir l'organization
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: { organization: true },
      });

      if (!contact) {
        throw new Error('Contact non trouvé');
      }

      // Trouver un admin ou le premier utilisateur pour créer le ticket
      const systemUser = await prisma.user.findFirst({
        where: {
          organizationId: contact.organizationId,
          role: { in: ['SUPER_ADMIN', 'ADMIN'] },
        },
      });

      const userId = systemUser?.id || (await prisma.user.findFirst({ where: { organizationId: contact.organizationId } }))?.id;

      if (!userId) {
        throw new Error('Impossible de créer le ticket : aucun utilisateur disponible');
      }

      // Générer un numéro de ticket unique
      const ticketNumber = `WAPP-${Date.now().toString().slice(-8)}`;

      // Créer le ticket
      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          subject: title,
          description: messageContent,
          category: 'Support',
          priority,
          status: TicketStatus.OPEN,
          source: TicketSource.WHATSAPP,
          contactId,
          createdById: userId,
          organizationId: contact.organizationId,
        },
      });

      console.log(`✅ Ticket créé: #${ticket.ticketNumber} pour ${contactName}`);

      // Envoyer une confirmation au contact (désactivé temporairement car le token Meta doit être rafraîchi)
      try {
        await this.sendMessage({
          to: originalMessage.from,
          message: `✅ Votre demande a été reçue.\n\nTicket #${ticket.ticketNumber}\n${title}\n\nNotre équipe vous contactera sous peu.`,
        });
      } catch (error) {
        console.warn('⚠️ Impossible d\'envoyer la confirmation WhatsApp (token invalide):', error.message);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du ticket:', error);
      throw error;
    }
  }

  /**
   * Générer un titre de ticket basé sur le contenu
   */
  private generateTicketTitle(message: string): string {
    // Prendre les 60 premiers caractères
    let title = message.substring(0, 60);

    // Nettoyer les sauts de ligne
    title = title.replace(/\n/g, ' ').trim();

    // Ajouter "..." si tronqué
    if (message.length > 60) {
      title += '...';
    }

    return title || 'Demande WhatsApp';
  }

  /**
   * Mettre à jour ou créer un contact
   */
  private async updateOrCreateContact(
    phoneNumber: string,
    name?: string
  ): Promise<WhatsAppContact> {
    const cleanPhone = this.cleanPhoneNumber(phoneNumber);

    // Récupérer la première organisation (par défaut)
    const defaultOrg = await prisma.organization.findFirst();
    
    if (!defaultOrg) {
      throw new Error('Aucune organisation trouvée. Créez une organisation d\'abord.');
    }

    const contact = await prisma.contact.upsert({
      where: { phoneNumber: cleanPhone },
      update: {
        lastMessageAt: new Date(),
        ...(name && { name }),
      },
      create: {
        phoneNumber: cleanPhone,
        name: name || undefined,
        lastMessageAt: new Date(),
        isBlocked: false,
        organizationId: defaultOrg.id,
      },
    });

    return contact as WhatsAppContact;
  }

  /**
   * Obtenir la liste des contacts
   */
  async getContacts(): Promise<WhatsAppContact[]> {
    const contacts = await prisma.contact.findMany({
      orderBy: { lastMessageAt: 'desc' },
    });

    return contacts as WhatsAppContact[];
  }

  /**
   * Obtenir un contact par ID
   */
  async getContactById(id: string): Promise<WhatsAppContact | null> {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    return contact as WhatsAppContact | null;
  }

  /**
   * Bloquer/débloquer un contact
   */
  async toggleBlockContact(id: string): Promise<WhatsAppContact> {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new Error('Contact non trouvé');
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: { isBlocked: !contact.isBlocked },
    });

    return updatedContact as WhatsAppContact;
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(newConfig: Partial<WhatsAppMetaConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.baseUrl = `https://graph.facebook.com/${this.config.graphApiVersion}`;
  }

  /**
   * Nettoyer un numéro de téléphone
   */
  private cleanPhoneNumber(phone: string): string {
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
   * Vérifier la signature du webhook (sécurité)
   */
  verifyWebhookSignature(signature: string, body: string): boolean {
    const appSecret = process.env.WHATSAPP_META_APP_SECRET;

    if (!appSecret) {
      console.warn('⚠️ WHATSAPP_META_APP_SECRET non configuré - signature non vérifiée');
      return true; // En dev, autoriser sans vérification
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(body)
        .digest('hex');

      return signature === `sha256=${expectedSignature}`;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la signature:', error);
      return false;
    }
  }

  /**
   * Gérer les erreurs de l'API Graph
   */
  private handleApiError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GraphApiError>;
      if (axiosError.response?.data?.error) {
        const { message, code, error_subcode } = axiosError.response.data.error;
        return new Error(
          `Meta API Error (${code}${error_subcode ? `/${error_subcode}` : ''}): ${message}`
        );
      }
    }

    return error instanceof Error ? error : new Error('Erreur inconnue');
  }

  /**
   * Extraire un message d'erreur lisible
   */
  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GraphApiError>;
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error.message;
      }
      return axiosError.message;
    }

    return error instanceof Error ? error.message : 'Erreur inconnue';
  }
}

// Export d'une instance singleton
export const whatsAppMetaService = new WhatsAppMetaService();
