import { prisma } from "../../config/database";
import { hashPassword } from "../../utils/password";
import { ApiError } from "../../utils/ApiError";
import type { CreateUserRequest, UserResponse } from "./users.types";

function formatUser(user: {
  id: string; email: string; firstName: string; lastName: string;
  role: string; status: string; lastLoginAt: Date | null;
  createdAt: Date; organizationId: string;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    organizationId: user.organizationId,
  };
}

export class UsersService {
  /**
   * Récupère tous les utilisateurs de l'organisation.
   */
  async findAll(organizationId: string): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return users.map(formatUser);
  }

  /**
   * Crée un nouvel utilisateur.
   */
  async create(data: CreateUserRequest, creatorOrgId: string): Promise<UserResponse> {
    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ApiError(409, `Email ${data.email} is already in use`);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role as "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "TECHNICIAN" | "USER",
        status: "ACTIVE",
        organizationId: data.organizationId || creatorOrgId,
      },
    });

    return formatUser(user);
  }

  /**
   * Met à jour un utilisateur (nom, rôle, statut).
   */
  async update(id: string, data: Partial<{ firstName: string; lastName: string; role: string; status: string }>): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.role && { role: data.role as "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "TECHNICIAN" | "USER" }),
        ...(data.status && { status: data.status as "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING" }),
      },
    });
    return formatUser(user);
  }

  /**
   * Désactive un utilisateur (soft delete via status).
   */
  async deactivate(id: string): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    return formatUser(user);
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur (par l'admin).
   */
  async resetPassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  /**
   * Supprime définitivement un utilisateur.
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}

export const usersService = new UsersService();
