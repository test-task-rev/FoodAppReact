/**
 * Onboarding type definitions
 * All measurements stored internally in metric (cm, kg)
 */

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
  EXTREMELY_ACTIVE = 'EXTREMELY_ACTIVE',
}

export enum GoalType {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  MAINTAIN_WEIGHT = 'MAINTAIN_WEIGHT',
  GAIN_WEIGHT = 'GAIN_WEIGHT',
}

export enum UnitSystem {
  METRIC = 'METRIC',
  IMPERIAL = 'IMPERIAL',
}

export interface OnboardingData {
  // Unit preference
  unitSystem: UnitSystem;

  // Basic info (always stored in metric internally)
  birthdate: Date;
  gender: Gender;
  heightCm: number; // stored in cm
  weightKg: number; // stored in kg

  // Activity & Goals
  activityLevel: ActivityLevel;
  goalType: GoalType;
  weightChangeRateKg: number; // kg per week

  // Account
  displayName: string;
  email: string;

  // Calculated values (required)
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export enum OnboardingStep {
  BASIC_INFO = 1,
  ACTIVITY = 2,
  GOAL = 3,
  SUMMARY = 4,
  ACCOUNT = 5,
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  data: OnboardingData;
  isComplete: boolean;
}

// Display helpers
export const getGenderLabel = (gender: Gender): string => {
  switch (gender) {
    case Gender.MALE:
      return 'Male';
    case Gender.FEMALE:
      return 'Female';
    case Gender.OTHER:
      return 'Other';
  }
};

export const getActivityLevelLabel = (level: ActivityLevel): string => {
  switch (level) {
    case ActivityLevel.SEDENTARY:
      return 'Sedentary';
    case ActivityLevel.LIGHTLY_ACTIVE:
      return 'Lightly Active';
    case ActivityLevel.MODERATELY_ACTIVE:
      return 'Moderately Active';
    case ActivityLevel.VERY_ACTIVE:
      return 'Very Active';
    case ActivityLevel.EXTREMELY_ACTIVE:
      return 'Extremely Active';
  }
};

export const getActivityLevelDescription = (level: ActivityLevel): string => {
  switch (level) {
    case ActivityLevel.SEDENTARY:
      return 'Little or no exercise';
    case ActivityLevel.LIGHTLY_ACTIVE:
      return 'Exercise 1-3 times/week';
    case ActivityLevel.MODERATELY_ACTIVE:
      return 'Exercise 4-5 times/week';
    case ActivityLevel.VERY_ACTIVE:
      return 'Daily exercise or intense 3-4 times/week';
    case ActivityLevel.EXTREMELY_ACTIVE:
      return 'Intense exercise 6-7 times/week';
  }
};

export const getGoalTypeLabel = (goal: GoalType): string => {
  switch (goal) {
    case GoalType.LOSE_WEIGHT:
      return 'Lose Weight';
    case GoalType.MAINTAIN_WEIGHT:
      return 'Maintain Weight';
    case GoalType.GAIN_WEIGHT:
      return 'Gain Weight';
  }
};

// Age calculation and validation
export const calculateAge = (birthdate: Date): number => {
  const today = new Date();
  const age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthdate.getDate())
  ) {
    return age - 1;
  }

  return age;
};

export const isValidAge = (birthdate: Date): boolean => {
  const age = calculateAge(birthdate);
  return age >= 13 && age < 120;
};
