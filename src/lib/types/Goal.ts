import { GoalType } from './Onboarding';

export interface Goal {
  id: number;
  userId: string;
  goalType: GoalType;
  weightChangeRateKg: number | null;
  weightGoalKg: number | null;
  calorieGoal: number | null;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoalInput {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface CreateGoalRequest {
  goalType: GoalType;
  weightChangeRateKg: number | null;
  weightGoalKg: number | null;
  calorieGoal: number | null;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
}
