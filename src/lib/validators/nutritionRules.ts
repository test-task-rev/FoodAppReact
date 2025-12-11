export const caloriesRules = {
  required: 'Calories is required',
  validate: (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Please enter a valid number';
    }
    if (num < 0) {
      return 'Calories cannot be negative';
    }
    if (num > 10000) {
      return 'Please enter a realistic calorie value';
    }
    return true;
  },
};

export const macroRules = {
  required: 'This field is required',
  validate: (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Please enter a valid number';
    }
    if (num < 0) {
      return 'Value cannot be negative';
    }
    if (num > 1000) {
      return 'Please enter a realistic value';
    }
    return true;
  },
};
