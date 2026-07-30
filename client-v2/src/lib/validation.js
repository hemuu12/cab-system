const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export const isEmail = value => EMAIL_PATTERN.test(value.trim());

/** Strips formatting and the optional 91 country prefix before validating. */
export const normalizePhone = (phone = '') => phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');

export function validatePassenger({ name, phone, email }) {
  const errors = {};
  const cleanName = name.trim();
  const phoneDigits = normalizePhone(phone);
  if (!cleanName) errors.name = 'Please enter the passenger name.';
  else if (cleanName.length < 2) errors.name = 'Name must contain at least 2 characters.';
  if (!phone.trim()) errors.phone = 'Please enter a phone number.';
  else if (!INDIAN_MOBILE_PATTERN.test(phoneDigits)) errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (email.trim() && !isEmail(email)) errors.email = 'Enter a valid email address, or leave it blank.';
  return errors;
}

export const isStrongPassword = value => value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

export const isOtpCode = value => /^\d{6}$/.test(value);
