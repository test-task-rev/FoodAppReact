export const exerciseNameRules = {
  required: 'Exercise name is required',
  validate: (value: string) => {
    if (value.trim().length === 0) {
      return 'Exercise name is required';
    }
    return true;
  },
};

export const durationRules = {
  required: 'Duration is required',
  validate: (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      return 'Duration must be a positive number';
    }
    return true;
  },
};

export const caloriesRules = {
  required: 'Calories are required',
  validate: (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      return 'Calories must be a positive number';
    }
    return true;
  },
};
