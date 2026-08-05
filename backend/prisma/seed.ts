// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

// =============================================================================
// Seed Data
// =============================================================================

const ORGANIZATION = {
  name: "Logismar",
  slug: "logismar",
  domain: "logismar.com",
  status: "ACTIVE",
};

const USERS = [
  {
    email: "fadwazr12@gmail.com",
    password: "Admin@1234",
    firstName: "Admin",
    lastName: "ITSM",
    role: "SUPER_ADMIN",
  },
  {
    email: "employee@gmail.com",
    password: "Employee@1234",
    firstName: "Ahmed",
    lastName: "Employé",
    role: "USER",
  },
  {
    email: "tech@gmail.com",
    password: "Tech@1234",
    firstName: "Sara",
    lastName: "Technicien",
    role: "TECHNICIAN",
  },
  {
    email: "manager@gmail.com",
    password: "Manager@1234",
    firstName: "Karim",
    lastName: "IT Manager",
    role: "MANAGER",
  },
  {
    email: "dept@gmail.com",
    password: "Dept@1234",
    firstName: "Fatima",
    lastName: "Dept Manager",
    role: "DEPT_MANAGER",
  },
];

// =============================================================================
// Seed Functions
// =============================================================================

async function seedOrganization() {
  const org = await prisma.organization.upsert({
    where: { slug: ORGANIZATION.slug },
    update: {},
    create: ORGANIZATION,
  });
  console.log(`✅ Organization: ${org.name} (${org.id})`);
  return org;
}

async function seedUsers(organizationId: string) {
  console.log("\n📋 Seeding users:");
  console.log("─".repeat(60));

  for (const user of USERS) {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        passwordHash: hash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: "ACTIVE",
        organizationId,
      },
    });
    console.log(`✅ [${created.role.padEnd(12)}] ${created.email}`);
  }
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  console.log("🌱 Starting database seed...\n");

  const organization = await seedOrganization();
  await seedUsers(organization.id);

  console.log("\n" + "═".repeat(60));
  console.log("✅ Database seeded successfully.");
  console.log("═".repeat(60));
  console.log("\n📋 Test credentials:");
  console.log("─".repeat(60));
  for (const user of USERS) {
    console.log(`  [${user.role.padEnd(12)}] ${user.email.padEnd(28)} / ${user.password}`);
  }
  console.log("─".repeat(60));
}

main()
  .catch((error: Error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
