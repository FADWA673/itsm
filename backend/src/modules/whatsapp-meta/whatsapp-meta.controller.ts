import { Request, Response } from 'express';
import { whatsAppMetaService } from './whatsapp-meta.service';
import {
  SendMessageRequest,
  SendTemplateRequest,
  SendMediaRequest,
  MetaWebhookPayload,
} from './whatsapp-meta.types';

class WhatsAppMetaController {
  /**
   * GET /api/v1/whatsapp-meta/status
   * Obtenir le statut du service Meta
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await whatsAppMetaService.getStatus();
      res.json(status);
    } catch (error) {
      console.error('❌ Erreur getStatus:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération du statut',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * GET /api/v1/whatsapp-meta/stats
   * Obtenir les statistiques
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await whatsAppMetaService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('❌ Erreur getStats:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des statistiques',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * POST /api/v1/whatsapp-meta/send
   * Envoyer un message texte
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { to, message } = req.body as SendMessageRequest;

      // Validation
      if (!to || !message) {
        res.status(400).json({
          error: 'Paramètres manquants',
          message: 'Les champs "to" et "message" sont requis',
        });
        return;
      }

      const result = await whatsAppMetaService.sendMessage({ to, message });

      res.json({
        success: true,
        message: 'Message envoyé avec succès',
        data: result,
      });
    } catch (error) {
      console.error('❌ Erreur sendMessage:', error);
      res.status(500).json({
        error: 'Erreur lors de l\'envoi du message',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * POST /api/v1/whatsapp-meta/send-template
   * Envoyer un message template
   */
  async sendTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { to, templateName, languageCode, components } = req.body as SendTemplateRequest;

      // Validation
      if (!to || !templateName) {
        res.status(400).json({
          error: 'Paramètres manquants',
          message: 'Les champs "to" et "templateName" sont requis',
        });
        return;
      }

      const result = await whatsAppMetaService.sendTemplate({
        to,
        templateName,
        languageCode,
        components,
      });

      res.json({
        success: true,
        message: 'Template envoyé avec succès',
        data: result,
      });
    } catch (error) {
      console.error('❌ Erreur sendTemplate:', error);
      res.status(500).json({
        error: 'Erreur lors de l\'envoi du template',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * POST /api/v1/whatsapp-meta/send-media
   * Envoyer un média (image, document, etc.)
   */
  async sendMedia(req: Request, res: Response): Promise<void> {
    try {
      const { to, mediaType, mediaUrl, caption, filename } = req.body as SendMediaRequest;

      // Validation
      if (!to || !mediaType || !mediaUrl) {
        res.status(400).json({
          error: 'Paramètres manquants',
          message: 'Les champs "to", "mediaType" et "mediaUrl" sont requis',
        });
        return;
      }

      const result = await whatsAppMetaService.sendMedia({
        to,
        mediaType,
        mediaUrl,
        caption,
        filename,
      });

      res.json({
        success: true,
        message: 'Média envoyé avec succès',
        data: result,
      });
    } catch (error) {
      console.error('❌ Erreur sendMedia:', error);
      res.status(500).json({
        error: 'Erreur lors de l\'envoi du média',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * GET /api/v1/whatsapp-meta/contacts
   * Obtenir la liste des contacts
   */
  async getContacts(req: Request, res: Response): Promise<void> {
    try {
      const contacts = await whatsAppMetaService.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error('❌ Erreur getContacts:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération des contacts',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * GET /api/v1/whatsapp-meta/contacts/:id
   * Obtenir un contact par ID
   */
  async getContactById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contact = await whatsAppMetaService.getContactById(id);

      if (!contact) {
        res.status(404).json({
          error: 'Contact non trouvé',
        });
        return;
      }

      res.json(contact);
    } catch (error) {
      console.error('❌ Erreur getContactById:', error);
      res.status(500).json({
        error: 'Erreur lors de la récupération du contact',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * PUT /api/v1/whatsapp-meta/contacts/:id/toggle-block
   * Bloquer/débloquer un contact
   */
  async toggleBlockContact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const contact = await whatsAppMetaService.toggleBlockContact(id);

      res.json({
        success: true,
        message: contact.isBlocked ? 'Contact bloqué' : 'Contact débloqué',
        data: contact,
      });
    } catch (error) {
      console.error('❌ Erreur toggleBlockContact:', error);
      res.status(500).json({
        error: 'Erreur lors du blocage/déblocage du contact',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * PUT /api/v1/whatsapp-meta/config
   * Mettre à jour la configuration
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body;

      // Validation basique
      if (!config || typeof config !== 'object') {
        res.status(400).json({
          error: 'Configuration invalide',
        });
        return;
      }

      whatsAppMetaService.updateConfig(config);

      res.json({
        success: true,
        message: 'Configuration mise à jour avec succès',
      });
    } catch (error) {
      console.error('❌ Erreur updateConfig:', error);
      res.status(500).json({
        error: 'Erreur lors de la mise à jour de la configuration',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * GET /api/v1/whatsapp-meta/webhook
   * Vérification du webhook par Meta (lors de la configuration)
   */
  async verifyWebhook(req: Request, res: Response): Promise<void> {
    try {
      const mode = req.query['hub.mode'] as string;
      const token = req.query['hub.verify_token'] as string;
      const challenge = req.query['hub.challenge'] as string;

      console.log('🔍 Vérification du webhook:', { mode, token, challenge });

      if (!mode || !token) {
        res.status(400).json({
          error: 'Paramètres de vérification manquants',
        });
        return;
      }

      const result = whatsAppMetaService.verifyWebhook(mode, token, challenge);

      if (result) {
        // Meta attend le challenge en réponse
        res.status(200).send(result);
      } else {
        res.status(403).json({
          error: 'Token de vérification invalide',
        });
      }
    } catch (error) {
      console.error('❌ Erreur verifyWebhook:', error);
      res.status(500).json({
        error: 'Erreur lors de la vérification du webhook',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  /**
   * POST /api/v1/whatsapp-meta/webhook
   * Recevoir les messages/événements de Meta
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Vérifier la signature (sécurité)
      const signature = req.headers['x-hub-signature-256'] as string;
      const rawBody = JSON.stringify(req.body);

      if (signature) {
        const isValid = whatsAppMetaService.verifyWebhookSignature(signature, rawBody);
        if (!isValid) {
          console.error('❌ Signature du webhook invalide');
          res.status(403).json({
            error: 'Signature invalide',
          });
          return;
        }
      }

      const payload = req.body as MetaWebhookPayload;

      // Traiter le webhook de manière asynchrone
      whatsAppMetaService.processWebhook(payload).catch((error) => {
        console.error('❌ Erreur lors du traitement du webhook:', error);
      });

      // Répondre immédiatement à Meta (requis)
      res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('❌ Erreur handleWebhook:', error);
      // Toujours répondre 200 à Meta pour éviter les retries
      res.status(200).send('EVENT_RECEIVED');
    }
  }

  /**
   * POST /api/v1/whatsapp-meta/test
   * Tester l'envoi d'un message
   */
  async testSend(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        res.status(400).json({
          error: 'Numéro de téléphone requis',
        });
        return;
      }

      const testMessage = `🧪 Test WhatsApp Meta API\n\nDate: ${new Date().toLocaleString('fr-FR')}\n\nCe message a été envoyé depuis le système ITSM pour tester la connexion.`;

      const result = await whatsAppMetaService.sendMessage({
        to: phoneNumber,
        message: testMessage,
      });

      res.json({
        success: true,
        message: 'Message de test envoyé avec succès',
        data: result,
      });
    } catch (error) {
      console.error('❌ Erreur testSend:', error);
      res.status(500).json({
        error: 'Erreur lors de l\'envoi du message de test',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}

export const whatsAppMetaController = new WhatsAppMetaController();
