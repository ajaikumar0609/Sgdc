import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or packages
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'shasthi_guru_dev_jwt_secret_change_in_production_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'shasthi_guru_secure_cookie_secret_key_32_chars_min',
  
  // Security & Feature Flags
  ENABLE_AADHAAR_COLLECTION: process.env.ENABLE_AADHAAR_COLLECTION === 'true',
  AADHAAR_ENCRYPTION_KEY: process.env.AADHAAR_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  
  ENABLE_DONATION_MODULE: process.env.ENABLE_DONATION_MODULE === 'true',
  ENABLE_PAYMENT_GATEWAY: process.env.ENABLE_PAYMENT_GATEWAY === 'true',
  PAYMENT_GATEWAY_PROVIDER: process.env.PAYMENT_GATEWAY_PROVIDER || 'none',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'test_webhook_secret',

  isProduction: process.env.NODE_ENV === 'production',
};
