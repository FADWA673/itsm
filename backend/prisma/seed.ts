// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

async function seedOrganization() {
  const org = await prisma.organization.upsert({
    where: { slug: "logismar" },
    update: {},
    create: {
      name: "Logismar",
      slug: "logismar",
      domain: "logismar.com",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Organization seeded: ${org.name} (${org.id})`);
  return org;
}

async function seedAdminUser(organizationId: string) {
  const hash = await bcrypt.hash("Admin@1234", SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: "fadwazr12@gmail.com" },
    update: {},
    create: {
      email: "fadwazr12@gmail.com",
      passwordHash: hash,
      firstName: "Admin",
      lastName: "ITSM",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      organizationId,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);
  return admin;
}

async function seedDemoUser(organizationId: string) {
  const hash = await bcrypt.hash("User@1234", SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email: "user@logismar.com" },
    update: {},
    create: {
      email: "user@logismar.com",
      passwordHash: hash,
      firstName: "Demo",
      lastName: "User",
      role: "USER",
      status: "ACTIVE",
      organizationId,
    },
  });
  console.log(`✅ Demo user seeded: ${user.email}`);
  return user;
}

async function main() {
  console.log("🌱 Starting database seed...\n");
  const organization = await seedOrganization();
  await seedAdminUser(organization.id);
  await seedDemoUser(organization.id);
  console.log("\n✅ Database seeded successfully.");
  console.log("\n📋 Default credentials (development only):");
  console.log("   Admin : admin@logismar.com / Admin@1234");
  console.log("   User  : user@logismar.com  / User@1234");
}

main()
  .catch((error: Error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
