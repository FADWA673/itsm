import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSLAConfigs() {
  console.log('🔧 Seeding SLA configurations...');

  const configs = [
    {
      priority: 'CRITICAL',
      responseTime: 30,    // 30 minutes pour première réponse
      resolveTime: 240,    // 4 heures pour résolution complète
    },
    {
      priority: 'HIGH',
      responseTime: 60,    // 1 heure
      resolveTime: 480,    // 8 heures
    },
    {
      priority: 'MEDIUM',
      responseTime: 240,   // 4 heures
      resolveTime: 1440,   // 24 heures (1 jour)
    },
    {
      priority: 'LOW',
      responseTime: 480,   // 8 heures
      resolveTime: 4320,   // 72 heures (3 jours)
    },
  ];

  for (const config of configs) {
    const result = await prisma.sLAConfig.upsert({
      where: { priority: config.priority },
      create: config,
      update: config,
    });

    console.log(`✅ SLA Config created/updated: ${result.priority}`);
    console.log(`   Response Time: ${result.responseTime} min | Resolve Time: ${result.resolveTime} min`);
  }

  console.log('✅ SLA configurations seeded successfully!');
}

seedSLAConfigs()
  .catch((error) => {
    console.error('❌ Error seeding SLA configs:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
