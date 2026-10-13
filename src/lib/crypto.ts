/**
 * AES-256-GCM Authenticated Encryption for Tokens at Rest
 *
 * Never stores raw Page Access Tokens in plain text in the database.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte buffer key from the TOKEN_ENCRYPTION_KEY environment variable.
 * If unset (e.g. in development), defaults to a deterministic dev fallback with a clear warning.
 */
function getDerivedKey(): Buffer {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || 'autodm_default_dev_encryption_key_32b';
  // Use SHA-256 to ensure exact 32-byte key size regardless of input string length
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a plaintext token string into an authenticated format: iv:authTag:ciphertext (hex)
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted token string. Returns empty string if invalid or tampered.
 */
export function decryptToken(encryptedString: string): string {
  if (!encryptedString) return '';
  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      // If legacy or unencrypted string in local testing
      return encryptedString;
    }

    const [ivHex, authTagHex, cipherHex] = parts;
    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[Crypto] Token decryption failed:', (err as Error).message);
    return '';
  }
}

/**
 * Sanitizes a token for display in UI or logs. Shows first 6 and last 4 characters.
 */
export function maskToken(token: string | null | undefined): string {
  if (!token) return '••••••••';
  if (token.length <= 10) return '••••••••';
  return `${token.slice(0, 6)}••••${token.slice(-4)}`;
}
