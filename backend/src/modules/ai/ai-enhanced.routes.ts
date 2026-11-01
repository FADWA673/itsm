/**
 * AI Enhanced Routes
 * Routes pour les fonctionnalités IA avancées
 */

import { Router } from 'express';
import * as aiController from './ai-enhanced.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * GET /api/v1/ai/test
 * Test la connexion au provider IA
 */
router.get('/test', aiController.testAI);

/**
 * POST /api/v1/ai/analyze-ticket-text
 * Analyse un texte libre pour créer un ticket
 * Body: { text: string, location?: string, department?: string }
 */
router.post('/analyze-ticket-text', aiController.analyzeTicketText);

/**
 * POST /api/v1/ai/suggest-technician
 * Suggère un technicien pour un ticket
 * Body: { category: string, priority: string, description: string }
 */
router.post('/suggest-technician', aiController.suggestTechnician);

/**
 * POST /api/v1/ai/search-kb
 * Recherche intelligente dans la base de connaissances
 * Body: { query: string }
 */
router.post('/search-kb', aiController.searchKB);

/**
 * POST /api/v1/ai/chat
 * Assistant conversationnel IA
 * Body: { messages: Array<{role: 'system'|'user'|'assistant', content: string}> }
 */
router.post('/chat', aiController.chat);

export default router;
