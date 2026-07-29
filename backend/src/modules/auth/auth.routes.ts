import { Router } from "express";
import { login, logout, refresh, forgotPassword, resetPassword } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * POST /api/v1/auth/login
 * Authentification avec email + mot de passe.
 */
router.post("/login", login);

/**
 * POST /api/v1/auth/logout
 * Déconnexion (stateless — suppression du token côté client).
 */
router.post("/logout", authenticate, logout);

/**
 * POST /api/v1/auth/refresh
 * Renouvellement du access token via refresh token.
 */
router.post("/refresh", refresh);

/**
 * POST /api/v1/auth/forgot-password
 * Envoi d'un lien de reset par email.
 */
router.post("/forgot-password", forgotPassword);

/**
 * POST /api/v1/auth/reset-password
 * Réinitialisation du mot de passe avec token.
 */
router.post("/reset-password", resetPassword);

export default router;
