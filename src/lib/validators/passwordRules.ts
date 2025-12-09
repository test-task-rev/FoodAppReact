export interface PasswordStrength {
  text: string;
  color: string;
  percentage: number;
}

const isStrongPassword = (password: string): boolean => {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

/**
 * Calculate password strength based on multiple criteria
 * @param password - Password to analyze
 * @returns Strength indicator with text, color, and percentage
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { text: '', color: '#999999', percentage: 0 };
  }

  let strength = 0;

  // Length-based scoring
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 25;

  // Character variety scoring
  if (/[a-z]/.test(password)) strength += 12.5;
  if (/[A-Z]/.test(password)) strength += 12.5;
  if (/[0-9]/.test(password)) strength += 12.5;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 12.5;

  // Categorize strength
  if (strength < 40) {
    return { text: 'Weak', color: '#FF3B30', percentage: strength };
  } else if (strength < 70) {
    return { text: 'Medium', color: '#FF9500', percentage: strength };
  } else {
    return { text: 'Strong', color: '#34C759', percentage: strength };
  }
};

export const passwordRules = {
  required: 'Password is required',
  minLength: {
    value: 8,
    message: 'Password must be at least 8 characters',
  },
};

export const strongPasswordRules = {
  required: 'Password is required',
  minLength: {
    value: 8,
    message: 'Password must be at least 8 characters',
  },
  validate: (value: string) => {
    if (!isStrongPassword(value)) {
      return 'Password must include letters and numbers';
    }
    return true;
  },
};

export const confirmPasswordRules = (passwordValue: string) => ({
  required: 'Please confirm your password',
  validate: (value: string) => {
    if (value !== passwordValue) {
      return 'Passwords do not match';
    }
    return true;
  },
});
