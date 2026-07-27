import { PrismaClient, UserRole, UserStatus, OrganizationStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// =============================================================================
// Helpers
// =============================================================================

/**
 * Hash simple pour le mot de passe de seed (dev uniquement).
 * En production, utiliser bcrypt (ITSM-005 Authentication).
 */
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// =============================================================================
// Seeds
// =============================================================================

async function seedOrganization() {
  const org = await prisma.organization.upsert({
    where: { slug: "logismar" },
    update: {},
    create: {
      name: "Logismar",
      slug: "logismar",
      domain: "logismar.com",
      status: OrganizationStatus.ACTIVE,
    },
  });

  console.log(`✅ Organization seeded: ${org.name} (${org.id})`);
  return org;
}

async function seedAdminUser(organizationId: string) {
  const admin = await prisma.user.upsert({
    where: { email: "admin@logismar.com" },
    update: {},
    create: {
      email: "admin@logismar.com",
      passwordHash: hashPassword("Admin@1234"),
      firstName: "Admin",
      lastName: "ITSM",
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      organizationId,
    },
  });

  console.log(`✅ Admin user seeded: ${admin.email} (${admin.id})`);
  return admin;
}

async function seedDemoUser(organizationId: string) {
  const user = await prisma.user.upsert({
    where: { email: "user@logismar.com" },
    update: {},
    create: {
      email: "user@logismar.com",
      passwordHash: hashPassword("User@1234"),
      firstName: "Demo",
      lastName: "User",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      organizationId,
    },
  });

  console.log(`✅ Demo user seeded: ${user.email} (${user.id})`);
  return user;
}

// =============================================================================
// Main
// =============================================================================

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
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
