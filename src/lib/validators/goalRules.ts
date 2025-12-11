import {
  MIN_CALORIE_GOAL,
  MAX_CALORIE_GOAL,
  MIN_MACRO_GOAL,
  MAX_MACRO_GOAL,
} from '../constants/nutrition';

export const calorieGoalRules = {
  required: {
    value: true,
    message: 'Calorie goal is required',
  },
  min: {
    value: MIN_CALORIE_GOAL,
    message: `Calorie goal must be at least ${MIN_CALORIE_GOAL} kcal`,
  },
  max: {
    value: MAX_CALORIE_GOAL,
    message: `Calorie goal must not exceed ${MAX_CALORIE_GOAL} kcal`,
  },
  pattern: {
    value: /^\d+$/,
    message: 'Calorie goal must be a whole number',
  },
};

export const macroGoalRules = (macroName: string) => ({
  required: {
    value: false,
    message: `${macroName} goal is optional`,
  },
  min: {
    value: MIN_MACRO_GOAL,
    message: `${macroName} goal cannot be negative`,
  },
  max: {
    value: MAX_MACRO_GOAL,
    message: `${macroName} goal must not exceed ${MAX_MACRO_GOAL}g`,
  },
  pattern: {
    value: /^\d+(\.\d{1})?$/,
    message: `${macroName} goal must be a valid number (max 1 decimal)`,
  },
});

export const validateCalorieInput = (value: string): string | undefined => {
  if (!value || value.trim() === '') {
    return calorieGoalRules.required.message;
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return 'Invalid number';
  }

  if (!calorieGoalRules.pattern.value.test(value)) {
    return calorieGoalRules.pattern.message;
  }

  if (numValue < calorieGoalRules.min.value) {
    return calorieGoalRules.min.message;
  }

  if (numValue > calorieGoalRules.max.value) {
    return calorieGoalRules.max.message;
  }

  return undefined;
};

export const validateMacroInput = (
  value: string,
  macroName: string
): string | undefined => {
  if (!value || value.trim() === '') {
    return undefined;
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return 'Invalid number';
  }

  const rules = macroGoalRules(macroName);

  if (!rules.pattern.value.test(value)) {
    return rules.pattern.message;
  }

  if (numValue < rules.min.value) {
    return rules.min.message;
  }

  if (numValue > rules.max.value) {
    return rules.max.message;
  }

  return undefined;
};
