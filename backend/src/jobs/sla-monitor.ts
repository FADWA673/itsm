import cron from 'node-cron';
import { slaService } from '../modules/sla/sla.service';
import { notify } from '../utils/notify';

/**
 * Cron job qui tourne toutes les 5 minutes
 * pour vérifier les SLA et alerter si nécessaire
 */
export function startSLAMonitor() {
  console.log('🔍 [SLA Monitor] Initializing...');

  // Exécuter toutes les 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [SLA Monitor] Running check at ${timestamp}...`);

    try {
      // 1. Marquer les tickets qui ont breached le SLA
      const breachedCount = await slaService.markBreachedTickets();
      
      if (breachedCount > 0) {
        console.log(`🚨 [SLA Monitor] ${breachedCount} ticket(s) breached SLA`);
        
        // Optionnel : Envoyer notification aux admins
        // Vous pouvez ajouter une notification globale ici
      }

      // 2. Alerter pour les tickets à risque (< 30 min restant)
      const ticketsAtRisk = await slaService.getTicketsAtRisk();

      if (ticketsAtRisk.length > 0) {
        console.log(`⚠️  [SLA Monitor] ${ticketsAtRisk.length} ticket(s) at risk`);

        for (const ticket of ticketsAtRisk) {
          const remainingTime = Math.floor(
            (new Date(ticket.slaDeadline!).getTime() - new Date().getTime()) / 60000
          );

          // Notifier le technicien assigné
          if (ticket.assignedToId) {
            await notify(
              ticket.assignedToId,
              'SLA_BREACH',
              '⚠️ SLA at risk',
              `Ticket ${ticket.ticketNumber} will breach SLA in ${remainingTime} minutes!`,
              ticket.id
            );

            console.log(`  → Notified technician for ticket ${ticket.ticketNumber} (${remainingTime} min remaining)`);
          } else {
            // Notifier le créateur si pas encore assigné
            await notify(
              ticket.createdById,
              'SLA_BREACH',
              '⚠️ Ticket not assigned - SLA at risk',
              `Your ticket ${ticket.ticketNumber} is not assigned yet and will breach SLA in ${remainingTime} minutes.`,
              ticket.id
            );

            console.log(`  → Notified creator for unassigned ticket ${ticket.ticketNumber}`);
          }
        }
      }

      console.log(`✅ [SLA Monitor] Check complete - ${breachedCount} breached, ${ticketsAtRisk.length} at risk`);
    } catch (error) {
      console.error('❌ [SLA Monitor] Error during check:', error);
    }
  });

  // Exécuter une première fois immédiatement (optionnel, pour test)
  console.log('✅ [SLA Monitor] Started (runs every 5 minutes)');
  console.log('📅 [SLA Monitor] Schedule: */5 * * * * (every 5 minutes)');
}

/**
 * Fonction helper pour formater le temps restant
 */
function formatTimeRemaining(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours}h ${mins}m`;
}
