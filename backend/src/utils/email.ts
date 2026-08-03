import nodemailer from "nodemailer";
import { config } from "../config";
import { logger } from "./logger";

// =============================================================================
// Transporter Nodemailer
// =============================================================================

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

// =============================================================================
// Templates d'email
// =============================================================================

/**
 * Envoie un email de reset de mot de passe.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  firstName: string
): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #1976D2; padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 2px; }
        .body { padding: 40px 30px; }
        .body h2 { color: #1a1a2e; margin-top: 0; }
        .body p { color: #555; line-height: 1.6; }
        .btn { display: inline-block; background: #1976D2; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .footer { background: #f5f5f5; padding: 20px 30px; text-align: center; color: #999; font-size: 13px; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 12px 16px; margin: 20px 0; border-radius: 4px; color: #e65100; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ITSM</h1>
        </div>
        <div class="body">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Bonjour <strong>${firstName}</strong>,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe ITSM Platform.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
          </div>
          <div class="warning">
            ⚠️ Ce lien est valable pendant <strong>1 heure</strong>. Après ce délai, vous devrez faire une nouvelle demande.
          </div>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre mot de passe reste inchangé.</p>
        </div>
        <div class="footer">
          <p>ITSM Platform — Logismar</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"ITSM Platform" <${config.smtp.from}>`,
      to,
      subject: "Réinitialisation de votre mot de passe ITSM",
      html,
    });
    logger.info(`Password reset email sent to ${to}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error("Failed to send reset email. Please try again.", { cause: error });
  }
}

/**
 * Vérifie que la connexion SMTP fonctionne.
 * Appelé au démarrage pour valider la config email.
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    logger.info("Email (SMTP) connection verified");
    return true;
  } catch {
    logger.warn("Email (SMTP) connection failed — emails will not be sent");
    return false;
  }
}
