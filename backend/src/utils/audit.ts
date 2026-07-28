import { logger } from "./logger";

// =============================================================================
// Types
// =============================================================================

/**
 * Catégories d'événements d'audit.
 */
export type AuditAction =
  // Auth
  | "AUTH_LOGIN"
  | "AUTH_LOGIN_FAILED"
  | "AUTH_LOGOUT"
  | "AUTH_TOKEN_REFRESH"
  | "AUTH_TOKEN_INVALID"
  | "AUTH_ACCESS_DENIED"
  // Users
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_PASSWORD_CHANGED"
  | "USER_STATUS_CHANGED"
  // Admin
  | "ADMIN_ACTION"
  // System
  | "SYSTEM_STARTUP"
  | "SYSTEM_SHUTDOWN"
  | "SYSTEM_CONFIG_CHANGED";

export interface AuditEvent {
  action: AuditAction;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  details?: Record<string, unknown>;
  success: boolean;
  timestamp: string;
}

// =============================================================================
// Audit Logger
// =============================================================================

/**
 * Enregistre un événement d'audit dans les logs.
 * En production, ces logs peuvent être redirigés vers un service centralisé
 * (ex: Elasticsearch, Datadog, CloudWatch).
 *
 * Usage :
 *   logAudit({
 *     action: "AUTH_LOGIN",
 *     userId: user.id,
 *     email: user.email,
 *     ip: req.ip,
 *     success: true
 *   })
 */
export function logAudit(event: Omit<AuditEvent, "timestamp">): void {
  const auditEvent: AuditEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  const logMessage = `[AUDIT] ${auditEvent.action} | user=${auditEvent.userId ?? "anonymous"} | success=${auditEvent.success}`;

  if (auditEvent.success) {
    logger.info(logMessage, { audit: auditEvent });
  } else {
    logger.warn(logMessage, { audit: auditEvent });
  }
}

/**
 * Helper — log un succès d'authentification.
 */
export function auditAuthSuccess(
  userId: string,
  email: string,
  ip?: string
): void {
  logAudit({
    action: "AUTH_LOGIN",
    userId,
    email,
    ip,
    success: true,
  });
}

/**
 * Helper — log un échec d'authentification.
 */
export function auditAuthFailure(email: string, ip?: string, reason?: string): void {
  logAudit({
    action: "AUTH_LOGIN_FAILED",
    email,
    ip,
    details: { reason },
    success: false,
  });
}

/**
 * Helper — log un accès refusé (403).
 */
export function auditAccessDenied(
  userId: string,
  resource: string,
  requiredRole: string,
  ip?: string
): void {
  logAudit({
    action: "AUTH_ACCESS_DENIED",
    userId,
    resource,
    details: { requiredRole },
    ip,
    success: false,
  });
}
