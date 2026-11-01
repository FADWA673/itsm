/**
 * Seed des catégories de tickets par défaut
 * À exécuter après la migration pour créer les catégories initiales
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  {
    name: "Hardware",
    description: "Problèmes matériels (ordinateurs, périphériques, etc.)",
    icon: "🖥️",
    color: "#3B82F6",
    displayOrder: 1,
  },
  {
    name: "Software",
    description: "Problèmes logiciels (applications, licences, bugs)",
    icon: "💿",
    color: "#8B5CF6",
    displayOrder: 2,
  },
  {
    name: "Network",
    description: "Problèmes réseau (Internet, WiFi, VPN)",
    icon: "🌐",
    color: "#10B981",
    displayOrder: 3,
  },
  {
    name: "Access & Security",
    description: "Accès, mots de passe, permissions, sécurité",
    icon: "🔐",
    color: "#EF4444",
    displayOrder: 4,
  },
  {
    name: "Telephony",
    description: "Téléphonie fixe et mobile",
    icon: "📞",
    color: "#F59E0B",
    displayOrder: 5,
  },
  {
    name: "Printer",
    description: "Imprimantes et scanners",
    icon: "🖨️",
    color: "#6B7280",
    displayOrder: 6,
  },
  {
    name: "Email",
    description: "Problèmes de messagerie électronique",
    icon: "📧",
    color: "#06B6D4",
    displayOrder: 7,
  },
  {
    name: "Other",
    description: "Autres demandes",
    icon: "📋",
    color: "#9CA3AF",
    displayOrder: 99,
  },
];

async function seedTicketCategories() {
  console.log("🌱 Starting ticket categories seed...");

  try {
    // Récupérer toutes les organisations
    const organizations = await prisma.organization.findMany({
      where: { status: "ACTIVE" },
    });

    if (organizations.length === 0) {
      console.log("⚠️  No organizations found. Please create an organization first.");
      return;
    }

    console.log(`📊 Found ${organizations.length} organization(s)`);

    for (const org of organizations) {
      console.log(`\n🏢 Seeding categories for organization: ${org.name} (${org.id})`);

      // Vérifier si des catégories existent déjà
      const existingCount = await prisma.ticketCategory.count({
        where: { organizationId: org.id },
      });

      if (existingCount > 0) {
        console.log(`   ℹ️  ${existingCount} categories already exist, skipping...`);
        continue;
      }

      // Créer les catégories par défaut
      for (const category of defaultCategories) {
        const created = await prisma.ticketCategory.create({
          data: {
            ...category,
            organizationId: org.id,
          },
        });
        console.log(`   ✅ Created: ${created.name} ${created.icon}`);
      }

      console.log(`   🎉 ${defaultCategories.length} categories created successfully!`);
    }

    console.log("\n✨ Ticket categories seed completed!");
  } catch (error) {
    console.error("❌ Error seeding ticket categories:", error);
    throw error;
  }
}

// Exécuter le seed
seedTicketCategories()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
