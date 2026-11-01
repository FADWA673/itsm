/**
 * Script pour mettre à jour les tickets existants avec leur SLA deadline
 * Les tickets créés avant l'implémentation du SLA n'ont pas de deadline
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingTickets() {
  console.log('🔄 Mise à jour des tickets existants avec SLA...\n');

  try {
    // 1. Récupérer toutes les configs SLA
    const slaConfigs = await prisma.sLAConfig.findMany();
    
    if (slaConfigs.length === 0) {
      console.log('❌ Aucune config SLA trouvée. Exécutez d\'abord: npx tsx prisma/seed-sla.ts');
      return;
    }

    console.log(`✅ ${slaConfigs.length} configs SLA trouvées\n`);

    // 2. Récupérer tous les tickets sans slaDeadline
    const ticketsWithoutSLA = await prisma.ticket.findMany({
      where: {
        slaDeadline: null,
      },
    });

    console.log(`📋 ${ticketsWithoutSLA.length} tickets sans SLA deadline trouvés\n`);

    if (ticketsWithoutSLA.length === 0) {
      console.log('✅ Tous les tickets ont déjà un SLA deadline!');
      return;
    }

    // 3. Mettre à jour chaque ticket
    let updated = 0;
    let failed = 0;

    for (const ticket of ticketsWithoutSLA) {
      try {
        // Trouver la config SLA pour cette priorité
        const slaConfig = slaConfigs.find((c) => c.priority === ticket.priority);

        if (!slaConfig) {
          console.log(`  ⚠️  Pas de config SLA pour priorité ${ticket.priority} (ticket ${ticket.ticketNumber})`);
          failed++;
          continue;
        }

        // Calculer la deadline basée sur la date de création
        const deadline = new Date(ticket.createdAt.getTime() + slaConfig.resolveTime * 60 * 1000);

        // Vérifier si déjà breached
        const now = new Date();
        const isBreached = deadline < now && !['RESOLVED', 'CLOSED'].includes(ticket.status);

        // Mettre à jour le ticket
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            slaDeadline: deadline,
            slaBreached: isBreached,
          },
        });

        console.log(`  ✅ ${ticket.ticketNumber} (${ticket.priority}): Deadline ${deadline.toISOString()}${isBreached ? ' [BREACHED]' : ''}`);
        updated++;
      } catch (error) {
        console.error(`  ❌ Erreur pour ticket ${ticket.ticketNumber}:`, error);
        failed++;
      }
    }

    console.log('\n====================================');
    console.log(`✅ ${updated} tickets mis à jour`);
    if (failed > 0) {
      console.log(`❌ ${failed} tickets échoués`);
    }
    console.log('====================================\n');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
updateExistingTickets()
  .then(() => {
    console.log('✨ Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script échoué:', error);
    process.exit(1);
  });
