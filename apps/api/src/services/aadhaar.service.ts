import crypto from 'crypto';
import { env } from '../config/env';

export interface AadhaarProcessResult {
  encrypted: string | null;
  masked: string | null;
}

export function processAadhaarNumber(rawAadhaar?: string | null): AadhaarProcessResult {
  if (!rawAadhaar || !env.ENABLE_AADHAAR_COLLECTION) {
    return { encrypted: null, masked: null };
  }

  const cleaned = rawAadhaar.replace(/\s+/g, '');
  if (cleaned.length !== 12 || !/^\d{12}$/.test(cleaned)) {
    throw new Error('Aadhaar number must contain exactly 12 digits');
  }

  // Generate Masked: XXXXXXXX1234
  const masked = `XXXXXXXX${cleaned.slice(-4)}`;

  // AES-256-GCM Encryption
  const key = crypto.createHash('sha256').update(env.AADHAAR_ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(cleaned, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:authTag:encrypted
  const serialized = `${iv.toString('hex')}:${authTag}:${encrypted}`;

  return { encrypted: serialized, masked };
}
