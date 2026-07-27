// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function validateConnection() {
  console.log("1️⃣  Testing database connection...");
  await prisma.$queryRaw`SELECT 1`;
  console.log("   ✅ Connection OK");
}

async function validateSchema() {
  console.log("2️⃣  Validating schema (table access)...");
  await prisma.organization.count();
  await prisma.user.count();
  console.log("   ✅ Schema OK — organizations and users tables accessible");
}

async function validateSeedData() {
  console.log("3️⃣  Validating seed data...");

  const org = await prisma.organization.findUnique({
    where: { slug: "logismar" },
  });

  if (!org) {
    console.log("   ⚠️  No seed data found — run: npm run db:seed");
    return;
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@logismar.com" },
  });

  if (!adminUser) {
    console.log("   ⚠️  Admin user not found — run: npm run db:seed");
    return;
  }

  console.log(`   ✅ Seed data OK — org: ${org.name}, admin: ${adminUser.email}`);
}

async function validateCRUD() {
  console.log("4️⃣  Validating CRUD operations...");

  const testOrg = await prisma.organization.create({
    data: {
      name: "Test Organization",
      slug: `test-validate-${Date.now()}`,
      status: "ACTIVE",
    },
  });

  const found = await prisma.organization.findUnique({
    where: { id: testOrg.id },
  });
  if (!found) throw new Error("Read failed");

  await prisma.organization.update({
    where: { id: testOrg.id },
    data: { name: "Test Organization Updated" },
  });

  await prisma.organization.delete({ where: { id: testOrg.id } });

  console.log("   ✅ CRUD OK — create, read, update, delete all working");
}

async function main() {
  console.log("🔍 Validating database environment...\n");

  try {
    await validateConnection();
    await validateSchema();
    await validateSeedData();
    await validateCRUD();
    console.log("\n✅ Database environment is fully operational.\n");
  } catch (error) {
    console.error("\n❌ Validation failed:", error);
    process.exit(1);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
