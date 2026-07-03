export const DISPOSABLE_DOMAINS = [
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'throwawaymail.com',
  'temp-mail.org',
];

export const TYPO_DOMAINS: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'hotnail.com': 'hotmail.com',
  'hormail.com': 'hotmail.com',
  'yahhoo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'outlok.com': 'outlook.com'
};

export function validateEmailSyntax(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function checkEmailTypo(email: string): string | null {
  const parts = email.split('@');
  if (parts.length !== 2) return null;
  const domain = parts[1].toLowerCase();
  
  if (TYPO_DOMAINS[domain]) {
    return `${parts[0]}@${TYPO_DOMAINS[domain]}`;
  }
  return null;
}

export function isDisposableEmail(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return true;
  const domain = parts[1].toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

export type PasswordStrength = 'Weak' | 'Medium' | 'Strong';

const COMMON_PASSWORDS = ['password123', '12345678', 'qwerty123', 'password', '123456789'];

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'Weak';
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) return 'Weak';

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const complexity = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  if (complexity < 3) return 'Weak';
  if (complexity === 3 && password.length >= 8) return 'Medium';
  if (complexity >= 3 && password.length >= 12) return 'Strong';
  if (complexity === 4 && password.length >= 8) return 'Strong';

  return 'Medium';
}

export function validatePasswordRules(password: string): string[] {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least 1 lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least 1 number');
  return errors;
}
