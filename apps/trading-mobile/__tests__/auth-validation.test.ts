import {
  validateDisplayName,
  validateEmail,
  validateNewPassword,
  validatePasswordPresence,
  validateSignInForm,
  validateSignUpForm,
} from '@/lib/auth-validation';

describe('validateEmail', () => {
  it('accepts a normal address and trims surrounding spaces', () => {
    expect(validateEmail(' trader@example.test ')).toBeUndefined();
  });

  it('rejects empty, spaced and malformed addresses', () => {
    expect(validateEmail('')).toBe('Enter your email.');
    expect(validateEmail('user @example.com')).toBe('Email must not contain spaces.');
    expect(validateEmail('no-at-sign')).toBe('Enter a valid email address.');
    expect(validateEmail('user@localhost')).toBe('Enter a valid email address.');
  });
});

describe('password rules', () => {
  it('only requires presence on sign-in', () => {
    expect(validatePasswordPresence('short')).toBeUndefined();
    expect(validatePasswordPresence('')).toBe('Enter your password.');
  });

  it('mirrors the registration length rules', () => {
    expect(validateNewPassword('short')).toBe('Password must be at least 12 characters.');
    expect(validateNewPassword('a'.repeat(129))).toBe(
      'Password must be at most 128 characters.',
    );
    expect(validateNewPassword('correct horse battery staple')).toBeUndefined();
  });

  it('rejects the email as the password', () => {
    expect(
      validateNewPassword('Trader@Example.test', 'trader@example.test'),
    ).toBe('Password must not be your email.');
  });
});

describe('display name rules', () => {
  it('requires a name, caps the length and rejects control characters', () => {
    expect(validateDisplayName('  ')).toBe('Enter a display name.');
    expect(validateDisplayName('a'.repeat(81))).toBe(
      'Display name must be at most 80 characters.',
    );
    expect(validateDisplayName('Ada\u0000')).toBe(
      'Display name must not contain control characters.',
    );
    expect(validateDisplayName(' Ada ')).toBeUndefined();
  });
});

describe('form validation', () => {
  it('reports both sign-in fields at once', () => {
    expect(validateSignInForm({ email: '', password: '' })).toEqual({
      email: 'Enter your email.',
      password: 'Enter your password.',
    });
  });

  it('returns no errors for a valid sign-up', () => {
    expect(
      validateSignUpForm({
        email: 'trader@example.test',
        password: 'correct horse battery staple',
        displayName: 'Ada',
      }),
    ).toEqual({});
  });

  it('reports every sign-up field', () => {
    const errors = validateSignUpForm({ email: 'nope', password: 'short', displayName: '' });

    expect(Object.keys(errors).sort()).toEqual(['displayName', 'email', 'password']);
  });
});
