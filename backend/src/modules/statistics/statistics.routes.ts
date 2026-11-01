/**
 * Statistics Routes
 * Routes pour les statistiques et le dashboard
 */

import { Router } from 'express';
import * as statisticsController from './statistics.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * GET /api/v1/statistics/dashboard
 * Récupère toutes les statistiques du dashboard
 * Accessible par: ADMIN, TECHNICIAN, MANAGER
 */
router.get('/dashboard', statisticsController.getDashboardStatistics);

/**
 * GET /api/v1/statistics/tickets-by-status
 * Récupère le nombre de tickets par statut
 * Accessible par: ADMIN, TECHNICIAN, MANAGER
 */
router.get('/tickets-by-status', statisticsController.getTicketsByStatus);

/**
 * GET /api/v1/statistics/tickets-over-time?days=7
 * Récupère l'évolution des tickets dans le temps
 * Query params: days (optionnel, défaut: 7)
 * Accessible par: ADMIN, TECHNICIAN, MANAGER
 */
router.get('/tickets-over-time', statisticsController.getTicketsOverTime);

/**
 * GET /api/v1/statistics/technician-performance
 * Récupère les performances des techniciens
 * Accessible par: ADMIN, MANAGER
 */
router.get('/technician-performance', statisticsController.getTechnicianPerformance);

/**
 * GET /api/v1/statistics/sla-compliance
 * Récupère les statistiques de conformité SLA
 * Accessible par: ADMIN, MANAGER
 */
router.get('/sla-compliance', statisticsController.getSLACompliance);

export default router;
