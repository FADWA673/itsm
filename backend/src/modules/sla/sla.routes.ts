import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as slaController from './sla.controller';

const router = Router();

// Toutes les routes nécessitent authentification
router.use(authenticate);

// GET /api/v1/sla/configs - Obtenir toutes les configs SLA
router.get('/configs', slaController.getAllConfigs);

// GET /api/v1/sla/configs/:priority - Obtenir config par priorité
router.get('/configs/:priority', slaController.getConfigByPriority);

// PUT /api/v1/sla/configs/:priority - Mettre à jour config (Admin only)
router.put('/configs/:priority', slaController.updateConfig);

// GET /api/v1/sla/tickets/at-risk - Tickets à risque
router.get('/tickets/at-risk', slaController.getTicketsAtRisk);

// GET /api/v1/sla/tickets/breached - Tickets breached
router.get('/tickets/breached', slaController.getBreachedTickets);

// GET /api/v1/sla/statistics - Statistiques SLA
router.get('/statistics', slaController.getStatistics);

// GET /api/v1/sla/tickets/:id/check - Vérifier SLA d'un ticket
router.get('/tickets/:id/check', slaController.checkTicketSLA);

export default router;
