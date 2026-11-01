import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedKB() {
  console.log("📚 Seeding Knowledge Base...");

  const org = await prisma.organization.findFirst();
  if (!org) {
    console.log("❌ No organization found");
    return;
  }

  const admin = await prisma.user.findFirst({
    where: { organizationId: org.id, role: "SUPER_ADMIN" },
  });

  if (!admin) {
    console.log("❌ No admin user found");
    return;
  }

  // Créer des catégories
  const categories = [
    {
      name: "Getting Started",
      slug: "getting-started",
      description: "Essential guides for new users",
      icon: "🚀",
      displayOrder: 1,
    },
    {
      name: "Network & Wi-Fi",
      slug: "network-wifi",
      description: "Network connectivity issues and solutions",
      icon: "📡",
      displayOrder: 2,
    },
    {
      name: "Hardware",
      slug: "hardware",
      description: "Computer, printer, and equipment guides",
      icon: "💻",
      displayOrder: 3,
    },
    {
      name: "Software & Applications",
      slug: "software-applications",
      description: "Application installation and troubleshooting",
      icon: "📱",
      displayOrder: 4,
    },
    {
      name: "Email & Communication",
      slug: "email-communication",
      description: "Email setup, Outlook, and communication tools",
      icon: "📧",
      displayOrder: 5,
    },
    {
      name: "Security & Access",
      slug: "security-access",
      description: "Password resets, VPN, and security best practices",
      icon: "🔒",
      displayOrder: 6,
    },
  ];

  for (const catData of categories) {
    const existing = await prisma.kBCategory.findFirst({
      where: { slug: catData.slug, organizationId: org.id },
    });

    if (!existing) {
      await prisma.kBCategory.create({
        data: { ...catData, organizationId: org.id },
      });
      console.log(`✅ Created category: ${catData.name}`);
    } else {
      console.log(`⏭️  Category exists: ${catData.name}`);
    }
  }

  // Créer quelques articles de test
  const networkCat = await prisma.kBCategory.findFirst({
    where: { slug: "network-wifi", organizationId: org.id },
  });

  if (networkCat) {
    const article1 = await prisma.kBArticle.findFirst({
      where: { slug: "how-to-connect-wifi", organizationId: org.id },
    });

    if (!article1) {
      await prisma.kBArticle.create({
        data: {
          title: "How to Connect to Company Wi-Fi",
          slug: "how-to-connect-wifi",
          content: `# How to Connect to Company Wi-Fi

## Step 1: Find the Network
Look for the network named "CompanyWiFi" in your available networks.

## Step 2: Enter Password
Use the password provided by IT department: **Welcome2024**

## Step 3: Accept Certificate
If prompted, accept the security certificate.

## Troubleshooting
- **Can't see the network?** Make sure Wi-Fi is enabled on your device
- **Wrong password?** Contact IT support for the current password
- **Still not working?** Try forgetting the network and reconnecting`,
          excerpt: "Step-by-step guide to connect to company Wi-Fi network",
          status: "PUBLISHED",
          publishedAt: new Date(),
          tags: "wifi,network,connection,setup",
          authorId: admin.id,
          categoryId: networkCat.id,
          organizationId: org.id,
          views: 45,
          helpful: 12,
          notHelpful: 1,
        },
      });
      console.log("✅ Created article: How to Connect to Company Wi-Fi");
    }
  }

  console.log("✅ Knowledge Base seeded successfully!");
}

seedKB()
  .catch((error) => {
    console.error("❌ Error seeding KB:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
