import { get, patch } from "./api";
import type { User } from "../types/auth.types";

export interface ProfileResponse extends Omit<User, "permissions"> {
  phone: string | null;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  organizationName?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * GET /api/v1/users/me
 * Récupère le profil complet de l'utilisateur connecté.
 */
export async function getMyProfile(): Promise<ProfileResponse> {
  return get<ProfileResponse>("/users/me");
}

/**
 * PATCH /api/v1/users/me
 * Met à jour firstName, lastName, phone.
 */
export async function updateMyProfile(data: UpdateProfilePayload): Promise<ProfileResponse> {
  return patch<ProfileResponse>("/users/me", data);
}

/**
 * PATCH /api/v1/users/me/password
 * Change le mot de passe de l'utilisateur connecté.
 */
export async function changeMyPassword(data: ChangePasswordPayload): Promise<void> {
  await patch("/users/me/password", data);
}
