import { createHash, timingSafeEqual } from 'crypto';

export const TOKEN_ISSUER = 'wondertravel-api';
export const TOKEN_AUDIENCE = 'wondertravel-web';
const isProduction = process.env.NODE_ENV === 'production';

function secret(name, developmentFallback) {
  const value = String(process.env[name] || '');
  if (isProduction && (value.length < 32 || /replace|development|change-me/i.test(value))) {
    throw new Error(`${name} must be a unique production secret of at least 32 characters`);
  }
  return value || developmentFallback;
}

export const accessSecret = () => secret('JWT_ACCESS_SECRET', 'development-access-secret-change-me');
export const otpSecret = () => secret('OTP_SECRET', 'development-otp-secret-change-me');
export const hashOpaqueToken = token => createHash('sha256').update(String(token || '')).digest('hex');

export function safeTokenMatch(token, expectedHash) {
  const supplied = Buffer.from(hashOpaqueToken(token), 'hex');
  const expected = Buffer.from(String(expectedHash || ''), 'hex');
  return supplied.length === expected.length && expected.length > 0 && timingSafeEqual(supplied, expected);
}

export function validateSecurityConfiguration() {
  const jwt = accessSecret();
  const otp = otpSecret();
  if (isProduction && jwt === otp) throw new Error('JWT_ACCESS_SECRET and OTP_SECRET must be different');
  if (isProduction && !process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in production');
}
