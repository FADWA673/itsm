import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAssets() {
  console.log("🌱 Seeding assets...");

  // Récupérer une organisation et des utilisateurs
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.log("❌ No organization found. Please run the main seed first.");
    return;
  }

  const users = await prisma.user.findMany({
    where: { organizationId: org.id },
    take: 3,
  });

  if (users.length === 0) {
    console.log("❌ No users found. Please run the main seed first.");
    return;
  }

  // Créer des assets
  const assets = [
    {
      serialNumber: "SN-2024-001",
      type: "LAPTOP",
      brand: "Dell",
      model: "Latitude 5520",
      status: "ACTIVE",
      location: "HQ - Floor 2",
      purchaseDate: new Date("2024-01-15"),
      warrantyExpiry: new Date("2027-01-15"),
      notes: "Standard employee laptop",
      assignedToId: users[0]?.id,
      organizationId: org.id,
    },
    {
      serialNumber: "SN-2024-002",
      type: "DESKTOP",
      brand: "HP",
      model: "EliteDesk 800 G8",
      status: "ACTIVE",
      location: "HQ - Floor 1",
      purchaseDate: new Date("2024-02-10"),
      warrantyExpiry: new Date("2027-02-10"),
      notes: "Workstation for graphic design",
      assignedToId: users[1]?.id,
      organizationId: org.id,
    },
    {
      serialNumber: "SN-2024-003",
      type: "PRINTER",
      brand: "Canon",
      model: "ImageRUNNER 2625",
      status: "ACTIVE",
      location: "HQ - Floor 3",
      purchaseDate: new Date("2023-11-20"),
      warrantyExpiry: new Date("2026-11-20"),
      notes: "Shared office printer",
      assignedToId: null,
      organizationId: org.id,
    },
    {
      serialNumber: "SN-2024-004",
      type: "SERVER",
      brand: "Dell",
      model: "PowerEdge R740",
      status: "ACTIVE",
      location: "Data Center",
      purchaseDate: new Date("2023-06-05"),
      warrantyExpiry: new Date("2028-06-05"),
      notes: "Main application server",
      assignedToId: null,
      organizationId: org.id,
    },
    {
      serialNumber: "SN-2023-089",
      type: "LAPTOP",
      brand: "Lenovo",
      model: "ThinkPad X1 Carbon",
      status: "MAINTENANCE",
      location: "Warehouse",
      purchaseDate: new Date("2023-03-12"),
      warrantyExpiry: new Date("2026-03-12"),
      notes: "Under repair - screen issue",
      assignedToId: users[2]?.id,
      organizationId: org.id,
    },
    {
      serialNumber: "SN-2022-045",
      type: "DESKTOP",
      brand: "HP",
      model: "ProDesk 600 G5",
      status: "RETIRED",
      location: "Storage",
      purchaseDate: new Date("2022-05-18"),
      warrantyExpiry: new Date("2025-05-18"),
      notes: "Replaced by newer model",
      assignedToId: null,
      organizationId: org.id,
    },
    {
      serialNumber: "SN-2024-005",
      type: "ROUTER",
      brand: "Cisco",
      model: "ISR 4331",
      status: "ACTIVE",
      location: "Data Center",
      purchaseDate: new Date("2024-01-08"),
      warrantyExpiry: new Date("2029-01-08"),
      notes: "Main network router",
      assignedToId: null,
      organizationId: org.id,
    },
    {
      serialNumber: "SN-2024-006",
      type: "LAPTOP",
      brand: "Apple",
      model: "MacBook Pro 16",
      status: "AVAILABLE",
      location: "HQ - IT Room",
      purchaseDate: new Date("2024-03-01"),
      warrantyExpiry: new Date("2027-03-01"),
      notes: "New stock - ready for assignment",
      assignedToId: null,
      organizationId: org.id,
    },
  ];

  for (const assetData of assets) {
    const existing = await prisma.asset.findUnique({
      where: { serialNumber: assetData.serialNumber },
    });

    if (!existing) {
      const asset = await prisma.asset.create({ data: assetData });
      console.log(`✅ Created asset: ${asset.serialNumber} (${asset.type})`);

      // Créer l'historique de création
      await prisma.assetHistory.create({
        data: {
          assetId: asset.id,
          action: "CREATED",
          newValue: asset.status,
          notes: "Asset created via seed",
          performedById: users[0]!.id,
        },
      });
    } else {
      console.log(`⏭️  Asset already exists: ${assetData.serialNumber}`);
    }
  }

  console.log("✅ Assets seeded successfully!");
}

seedAssets()
  .catch((error) => {
    console.error("❌ Error seeding assets:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
