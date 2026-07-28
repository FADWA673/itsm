import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hash un mot de passe en clair avec bcrypt.
 * Salt rounds = 12 — bon équilibre sécurité/performance.
 *
 * @param plainPassword - Le mot de passe en clair
 * @returns Le hash bcrypt
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare un mot de passe en clair avec un hash bcrypt.
 *
 * @param plainPassword - Le mot de passe en clair saisi par l'utilisateur
 * @param hashedPassword - Le hash stocké en base de données
 * @returns true si le mot de passe correspond
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Valide la complexité d'un mot de passe.
 * Règles : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.
 *
 * @param password - Le mot de passe à valider
 * @returns true si le mot de passe respecte les règles
 */
export function isPasswordStrong(password: string): boolean {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}
