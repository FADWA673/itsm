import { prisma } from "../../config/database";
import { comparePassword, hashPassword, isPasswordStrong } from "../../utils/password";
import { generateTokenPair, verifyRefreshToken, verifyAccessToken } from "../../utils/jwt";
import { ApiError } from "../../utils/ApiError";
import { auditAuthSuccess, auditAuthFailure } from "../../utils/audit";
import { sendPasswordResetEmail } from "../../utils/email";
import type { LoginResponse } from "./auth.types";

export class AuthService {
  /**
   * Authentifie un utilisateur avec email + mot de passe.
   * Retourne les tokens JWT si les credentials sont valides.
   */
  async login(email: string, password: string, ip?: string): Promise<LoginResponse> {
    // 1. Chercher l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.deletedAt) {
      auditAuthFailure(email, ip, "User not found");
      throw new ApiError(401, "Invalid email or password");
    }

    // 2. Vérifier le statut
    if (user.status !== "ACTIVE") {
      auditAuthFailure(email, ip, `Account ${user.status}`);
      throw new ApiError(401, "Account is not active. Please contact support.");
    }

    // 3. Vérifier le mot de passe
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      auditAuthFailure(email, ip, "Invalid password");
      throw new ApiError(401, "Invalid email or password");
    }

    // 4. Générer les tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
    const tokens = generateTokenPair(payload);

    // 5. Mettre à jour lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    auditAuthSuccess(user.id, user.email, ip);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  /**
   * Renouvelle les tokens à partir d'un refresh token valide.
   */
  async refresh(refreshToken: string): Promise<LoginResponse> {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user || user.deletedAt || user.status !== "ACTIVE") {
      throw new ApiError(401, "Invalid refresh token");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
    const tokens = generateTokenPair(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  /**
   * Déclenche le processus de reset de mot de passe.
   * Pour l'instant : log le token (email SMTP sera configuré dans ITSM-014).
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    // Toujours retourner succès pour ne pas révéler si l'email existe
    if (!user || user.deletedAt) return;

    // Générer un token de reset (valide 7j — même durée que access token)
    const payload = { sub: user.id, email: user.email, role: "reset", organizationId: user.organizationId };
    const { accessToken: resetToken } = generateTokenPair(payload);

    // Envoyer l'email de reset
    await sendPasswordResetEmail(user.email, resetToken, user.firstName);
  }

  /**
   * Réinitialise le mot de passe avec un token valide.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!isPasswordStrong(newPassword)) {
      throw new ApiError(400, "Password must be at least 8 characters with uppercase, lowercase, number and special character.");
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user || user.deletedAt) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }
}

export const authService = new AuthService();
