export interface DailyCalorieEntry {
  date: Date;
  totalCalories: number;
}

export interface DailyMacroEntry {
  date: Date;
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export interface DailyActivityEntry {
  date: Date;
  caloriesBurned: number;
  mealsLogged: number;
  caloriesConsumed: number;
}

export interface UserGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export interface ProgressStats {
  averageCalories: number;
  loggingStreak: number;
  mealsLastWeek: number;
}

export enum CaloriePeriod {
  ThirtyDays = 30,
  SixtyDays = 60,
  NinetyDays = 90,
}

export enum WeightPeriod {
  NinetyDays = 90,
  OneEightyDays = 180,
  OneYear = 365,
}
