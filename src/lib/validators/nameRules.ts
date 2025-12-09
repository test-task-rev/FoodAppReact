export const nameRules = {
  required: 'Name is required',
  minLength: {
    value: 2,
    message: 'Name must be at least 2 characters',
  },
  validate: (value: string) => {
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return true;
  },
};
