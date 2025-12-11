export const foodNameRules = {
  required: 'Food name is required',
  validate: (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return 'Please enter a food name';
    }
    if (trimmed.length < 2) {
      return 'Food name must be at least 2 characters';
    }
    return true;
  },
};
