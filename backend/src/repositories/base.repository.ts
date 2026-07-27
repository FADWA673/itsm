import { prisma } from "../config/database";

/**
 * Repository de base — pattern générique partagé par tous les repositories.
 * Fournit les opérations CRUD standard avec TypeScript complet.
 *
 * Usage :
 *   class UserRepository extends BaseRepository<User, Prisma.UserDelegate> {
 *     constructor() { super("user") }
 *   }
 */
export abstract class BaseRepository {
  protected readonly prisma = prisma;
}

export { prisma };
