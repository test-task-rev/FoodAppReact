import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { API_URLS } from '../config/api';
import { Goal, GoalInput, CreateGoalRequest } from '../types/Goal';
import { GOAL_COMPARISON_THRESHOLD } from '../constants/nutrition';

interface UseGoalsReturn {
  currentGoal: Goal | null;
  allGoals: Goal[];
  goalInput: GoalInput;
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
  updateGoalInput: (field: keyof GoalInput, value: string) => void;
  saveGoal: () => Promise<void>;
  refreshGoals: () => Promise<void>;
  clearError: () => void;
}

const hasGoalChanged = (newValue: string, oldValue: number | null): boolean => {
  if (!newValue || newValue.trim() === '') {
    return oldValue !== null;
  }

  const numValue = parseFloat(newValue);
  if (isNaN(numValue)) {
    return false;
  }

  if (oldValue === null) {
    return true;
  }

  return Math.abs(numValue - oldValue) > GOAL_COMPARISON_THRESHOLD;
};

export const useGoals = (): UseGoalsReturn => {
  const api = useApi(API_URLS.USER_SERVICE);

  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [goalInput, setGoalInput] = useState<GoalInput>({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = useCallback((): boolean => {
    if (!currentGoal) return false;

    const calorieChanged = hasGoalChanged(goalInput.calories, currentGoal.calorieGoal);
    const proteinChanged = hasGoalChanged(goalInput.protein, currentGoal.proteinGoal);
    const carbsChanged = hasGoalChanged(goalInput.carbs, currentGoal.carbsGoal);
    const fatChanged = hasGoalChanged(goalInput.fat, currentGoal.fatGoal);

    return calorieChanged || proteinChanged || carbsChanged || fatChanged;
  }, [currentGoal, goalInput]);

  const loadGoals = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const [current, all] = await Promise.all([
        api.get<Goal>('/goal'),
        api.get<Goal[]>('/goals'),
      ]);

      setCurrentGoal(current);
      setAllGoals(all);

      setGoalInput({
        calories: current.calorieGoal?.toString() || '',
        protein: current.proteinGoal?.toString() || '',
        carbs: current.carbsGoal?.toString() || '',
        fat: current.fatGoal?.toString() || '',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load goals';
      setError(errorMessage);
      console.error('Failed to load goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const updateGoalInput = useCallback((field: keyof GoalInput, value: string) => {
    setGoalInput(prev => ({ ...prev, [field]: value }));
  }, []);

  const saveGoal = useCallback(async (): Promise<void> => {
    if (!currentGoal) {
      setError('No goal loaded');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parseValue = (value: string): number | null => {
        if (!value || value.trim() === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };

      const request: CreateGoalRequest = {
        goalType: currentGoal.goalType,
        weightChangeRateKg: currentGoal.weightChangeRateKg,
        weightGoalKg: currentGoal.weightGoalKg,
        calorieGoal: parseValue(goalInput.calories) ?? currentGoal.calorieGoal,
        proteinGoal: parseValue(goalInput.protein) ?? currentGoal.proteinGoal,
        carbsGoal: parseValue(goalInput.carbs) ?? currentGoal.carbsGoal,
        fatGoal: parseValue(goalInput.fat) ?? currentGoal.fatGoal,
      };

      const newGoal = await api.post<Goal>('/goal', request);

      setCurrentGoal(newGoal);
      setGoalInput({
        calories: newGoal.calorieGoal?.toString() || '',
        protein: newGoal.proteinGoal?.toString() || '',
        carbs: newGoal.carbsGoal?.toString() || '',
        fat: newGoal.fatGoal?.toString() || '',
      });

      const updatedGoals = await api.get<Goal[]>('/goals');
      setAllGoals(updatedGoals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save goal';
      setError(errorMessage);
      console.error('Failed to save goal:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, currentGoal, goalInput]);

  const refreshGoals = useCallback(async (): Promise<void> => {
    return loadGoals();
  }, [loadGoals]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    currentGoal,
    allGoals,
    goalInput,
    isLoading,
    error,
    hasChanges: hasChanges(),
    updateGoalInput,
    saveGoal,
    refreshGoals,
    clearError,
  };
};
