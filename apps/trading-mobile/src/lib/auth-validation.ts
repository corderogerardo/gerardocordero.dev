/**
 * Auth form validation. Mirrors the server's registration rules so a typo costs
 * a keystroke instead of a round-trip; the server remains the authority.
 */

export interface AuthFieldErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;
export const DISPLAY_NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 254;

export function validateEmail(raw: string): string | undefined {
  const value = raw.trim();
  if (value.length === 0) return 'Enter your email.';
  if (value.length > EMAIL_MAX_LENGTH) {
    return `Email must be at most ${EMAIL_MAX_LENGTH} characters.`;
  }
  if (/\s/.test(value)) return 'Email must not contain spaces.';
  if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address.';
  return undefined;
}

/** Sign-in only needs the field to be present; the server decides validity. */
export function validatePasswordPresence(raw: string): string | undefined {
  return raw.length === 0 ? 'Enter your password.' : undefined;
}

export function validateNewPassword(raw: string, email?: string): string | undefined {
  const missing = validatePasswordPresence(raw);
  if (missing) return missing;

  if (raw.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (raw.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  if (email && raw.trim().toLowerCase() === email.trim().toLowerCase()) {
    return 'Password must not be your email.';
  }
  return undefined;
}

export function validateDisplayName(raw: string): string | undefined {
  const value = raw.trim();
  if (value.length === 0) return 'Enter a display name.';
  if (value.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`;
  }
  if (CONTROL_CHARACTERS.test(value)) return 'Display name must not contain control characters.';
  return undefined;
}

export function validateSignInForm(input: { email: string; password: string }): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  const email = validateEmail(input.email);
  const password = validatePasswordPresence(input.password);

  if (email) errors.email = email;
  if (password) errors.password = password;
  return errors;
}

export function validateSignUpForm(input: {
  email: string;
  password: string;
  displayName: string;
}): AuthFieldErrors {
  const errors = validateSignInForm({ email: input.email, password: input.password });

  const newPassword = validateNewPassword(input.password, input.email);
  if (newPassword) errors.password = newPassword;

  const displayName = validateDisplayName(input.displayName);
  if (displayName) errors.displayName = displayName;

  return errors;
}

export function hasAuthErrors(errors: AuthFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
