import jwt from "jsonwebtoken";
import { config } from "../config";
import { ApiError } from "./ApiError";

// =============================================================================
// Types
// =============================================================================

export interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: string;
  organizationId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;  // secondes
}

// =============================================================================
// Génération des tokens
// =============================================================================

/**
 * Génère un access token JWT signé.
 * Durée de vie courte (7d par défaut).
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: "itsm-platform",
    audience: "itsm-api",
  } as jwt.SignOptions);
}

/**
 * Génère un refresh token JWT signé.
 * Durée de vie longue (30d par défaut).
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(
    { sub: payload.sub },
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: "itsm-platform",
      audience: "itsm-refresh",
    } as jwt.SignOptions
  );
}

/**
 * Génère la paire access + refresh token.
 */
export function generateTokenPair(payload: JwtPayload): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Calcul de l'expiration en secondes
  const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
  const expiresIn = decoded?.exp
    ? decoded.exp - Math.floor(Date.now() / 1000)
    : 604800; // 7 jours par défaut

  return { accessToken, refreshToken, expiresIn };
}

// =============================================================================
// Vérification des tokens
// =============================================================================

/**
 * Vérifie et décode un access token.
 * @throws ApiError 401 si le token est invalide ou expiré
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: "itsm-platform",
      audience: "itsm-api",
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Invalid access token");
  }
}

/**
 * Vérifie et décode un refresh token.
 * @throws ApiError 401 si le token est invalide ou expiré
 */
export function verifyRefreshToken(token: string): { sub: string } {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: "itsm-platform",
      audience: "itsm-refresh",
    }) as { sub: string };
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Refresh token expired");
    }
    throw new ApiError(401, "Invalid refresh token");
  }
}
