const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const emailRules = {
  required: 'Email is required',
  validate: (value: string) => {
    const trimmed = value.trim();
    if (!trimmed.includes('@')) {
      return 'Please enter a valid email address';
    }
    if (!isValidEmail(trimmed)) {
      return 'Please enter a valid email address';
    }
    return true;
  },
};
