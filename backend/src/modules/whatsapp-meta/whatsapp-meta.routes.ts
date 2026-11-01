import { Router } from 'express';
import { whatsAppMetaController } from './whatsapp-meta.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Routes publiques (pour les webhooks Meta)
router.get('/webhook', whatsAppMetaController.verifyWebhook.bind(whatsAppMetaController));
router.post('/webhook', whatsAppMetaController.handleWebhook.bind(whatsAppMetaController));

// Routes protégées (nécessitent authentification)
router.use(authenticate);

// Statut et statistiques
router.get('/status', whatsAppMetaController.getStatus.bind(whatsAppMetaController));
router.get('/stats', whatsAppMetaController.getStats.bind(whatsAppMetaController));

// Envoi de messages
router.post('/send', whatsAppMetaController.sendMessage.bind(whatsAppMetaController));
router.post('/send-template', whatsAppMetaController.sendTemplate.bind(whatsAppMetaController));
router.post('/send-media', whatsAppMetaController.sendMedia.bind(whatsAppMetaController));
router.post('/test', whatsAppMetaController.testSend.bind(whatsAppMetaController));

// Gestion des contacts
router.get('/contacts', whatsAppMetaController.getContacts.bind(whatsAppMetaController));
router.get('/contacts/:id', whatsAppMetaController.getContactById.bind(whatsAppMetaController));
router.put('/contacts/:id/toggle-block', whatsAppMetaController.toggleBlockContact.bind(whatsAppMetaController));

// Configuration
router.put('/config', whatsAppMetaController.updateConfig.bind(whatsAppMetaController));

export default router;
