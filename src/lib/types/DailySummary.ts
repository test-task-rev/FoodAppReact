export interface DailySummaryData {
  // From InsightService API
  aiSummary: string | null;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  foodLogCount: number;
  exerciseCount: number;

  // Computed from food logs
  mealBreakdown: MealBreakdownEntry[];
  topFoods: TopFoodEntry[];

  // Computed from exercise logs
  exerciseSummary: ExerciseSummary | null;

  // Goals from ProfileProvider
  goals: {
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  };
}

export interface MealBreakdownEntry {
  mealType: string;
  calories: number;
  percentage: number;
}

export interface TopFoodEntry {
  rank: number;
  foodName: string;
  calories: number;
  mealType: string;
  portion: number;
  unit: string;
}

export interface ExerciseSummary {
  totalCaloriesBurned: number;
  exerciseCount: number;
  exercises: ExerciseDetail[];
}

export interface ExerciseDetail {
  exerciseName: string;
  durationMinutes: number;
  caloriesBurned: number;
}

export interface InsightServiceResponse {
  summary: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  foodLogCount: number;
  exerciseCount: number;
}
