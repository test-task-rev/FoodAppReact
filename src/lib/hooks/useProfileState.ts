import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { API_URLS } from '../config/api';
import { UserProfile, UpdateProfileRequest } from '../types/UserProfile';
import { Goal, GoalInput, CreateGoalRequest } from '../types/Goal';
import { Gender, ActivityLevel, UnitSystem } from '../types/Onboarding';
import { GOAL_COMPARISON_THRESHOLD } from '../constants/nutrition';
import SecureStorage from '../storage/SecureStorage';

const hasGoalChanged = (newValue: string, oldValue: number): boolean => {
  if (!newValue || newValue.trim() === '') {
    return false;
  }

  const numValue = parseFloat(newValue);
  if (isNaN(numValue)) {
    return false;
  }

  return Math.abs(numValue - oldValue) > GOAL_COMPARISON_THRESHOLD;
};

export const parseGender = (genderStr: string): Gender => {
  switch (genderStr.toUpperCase()) {
    case 'MALE':
      return Gender.MALE;
    case 'FEMALE':
      return Gender.FEMALE;
    case 'OTHER':
      return Gender.OTHER;
    default:
      return Gender.MALE;
  }
};

export const parseActivityLevel = (activityStr: string): ActivityLevel => {
  switch (activityStr.toUpperCase()) {
    case 'SEDENTARY':
      return ActivityLevel.SEDENTARY;
    case 'LIGHTLY_ACTIVE':
      return ActivityLevel.LIGHTLY_ACTIVE;
    case 'MODERATELY_ACTIVE':
      return ActivityLevel.MODERATELY_ACTIVE;
    case 'VERY_ACTIVE':
      return ActivityLevel.VERY_ACTIVE;
    case 'EXTREMELY_ACTIVE':
    case 'EXTRA_ACTIVE':
      return ActivityLevel.EXTREMELY_ACTIVE;
    default:
      return ActivityLevel.MODERATELY_ACTIVE;
  }
};

export const parseUnitSystem = (unitStr: string): UnitSystem => {
  return unitStr.toUpperCase() === 'IMPERIAL' ? UnitSystem.IMPERIAL : UnitSystem.METRIC;
};

export function useProfileState() {
  const userApi = useApi(API_URLS.USER_SERVICE);

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Goals state
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [goalInput, setGoalInput] = useState<GoalInput>({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  // Fetch profile
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    setIsLoadingProfile(true);
    setProfileError(null);

    try {
      const user = await SecureStorage.getUser();
      if (!user?.userId) {
        throw new Error('User not authenticated');
      }

      const response = await userApi.get<UserProfile>('/profile');
      setProfile(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setProfileError(errorMessage);
      console.error('Failed to load profile:', err);
      return null;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [userApi]);

  // Update profile
  const updateProfile = useCallback(
    async (updates: UpdateProfileRequest): Promise<void> => {
      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const user = await SecureStorage.getUser();
        if (!user?.userId) {
          throw new Error('User not authenticated');
        }

        const response = await userApi.put<UserProfile>('/profile', updates);
        setProfile(response);

        // Update local user data if displayName changed
        if (updates.displayName !== user.displayName) {
          await SecureStorage.saveUser({
            ...user,
            displayName: updates.displayName,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
        setProfileError(errorMessage);
        console.error('Failed to update profile:', err);
        throw err;
      } finally {
        setIsLoadingProfile(false);
      }
    },
    [userApi]
  );

  // Fetch goals
  const fetchGoals = useCallback(async (): Promise<void> => {
    setIsLoadingGoals(true);
    setGoalError(null);

    try {
      const [current, all] = await Promise.all([
        userApi.get<Goal>('/goal'),
        userApi.get<Goal[]>('/goals'),
      ]);

      setCurrentGoal(current);
      setAllGoals(all);

      setGoalInput({
        calories: current.calorieGoal.toString(),
        protein: current.proteinGoal.toString(),
        carbs: current.carbsGoal.toString(),
        fat: current.fatGoal.toString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load goals';
      setGoalError(errorMessage);
      console.error('Failed to load goals:', err);
    } finally {
      setIsLoadingGoals(false);
    }
  }, [userApi]);

  // Update goal input
  const updateGoalInput = useCallback((field: keyof GoalInput, value: string) => {
    setGoalInput(prev => ({ ...prev, [field]: value }));
  }, []);

  // Save goal
  const saveGoal = useCallback(async (): Promise<void> => {
    if (!currentGoal) {
      setGoalError('No goal loaded');
      return;
    }

    setIsLoadingGoals(true);
    setGoalError(null);

    try {
      const parseValue = (value: string, fallback: number): number => {
        if (!value || value.trim() === '') return fallback;
        const num = parseFloat(value);
        return isNaN(num) ? fallback : num;
      };

      const request: CreateGoalRequest = {
        goalType: currentGoal.goalType,
        weightChangeRateKg: currentGoal.weightChangeRateKg,
        weightGoalKg: currentGoal.weightGoalKg,
        calorieGoal: parseValue(goalInput.calories, currentGoal.calorieGoal),
        proteinGoal: parseValue(goalInput.protein, currentGoal.proteinGoal),
        carbsGoal: parseValue(goalInput.carbs, currentGoal.carbsGoal),
        fatGoal: parseValue(goalInput.fat, currentGoal.fatGoal),
      };

      const newGoal = await userApi.post<Goal>('/goal', request);

      setCurrentGoal(newGoal);
      setGoalInput({
        calories: newGoal.calorieGoal.toString(),
        protein: newGoal.proteinGoal.toString(),
        carbs: newGoal.carbsGoal.toString(),
        fat: newGoal.fatGoal.toString(),
      });

      const updatedGoals = await userApi.get<Goal[]>('/goals');
      setAllGoals(updatedGoals);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save goal';
      setGoalError(errorMessage);
      console.error('Failed to save goal:', err);
      throw err;
    } finally {
      setIsLoadingGoals(false);
    }
  }, [userApi, currentGoal, goalInput]);

  // Get goal for specific date
  const getGoalForDate = useCallback(
    (date: Date): Goal | null => {
      if (allGoals.length === 0) return currentGoal;

      // Sort goals by createdAt descending (newest first)
      const sortedGoals = [...allGoals].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Find the goal that was active on the given date
      // The goal is active from its createdAt until the next goal's createdAt
      for (const goal of sortedGoals) {
        const goalDate = new Date(goal.createdAt);
        goalDate.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate >= goalDate) {
          return goal;
        }
      }

      // If no goal found for the date, return the oldest goal
      return sortedGoals[sortedGoals.length - 1] || currentGoal;
    },
    [allGoals, currentGoal]
  );

  // Get unit system
  const getUnitSystem = useCallback((): UnitSystem => {
    return profile?.unitSystem || UnitSystem.METRIC;
  }, [profile]);

  // Check if goals have changes
  const hasGoalChanges = useCallback((): boolean => {
    if (!currentGoal) return false;

    const calorieChanged = hasGoalChanged(goalInput.calories, currentGoal.calorieGoal);
    const proteinChanged = hasGoalChanged(goalInput.protein, currentGoal.proteinGoal);
    const carbsChanged = hasGoalChanged(goalInput.carbs, currentGoal.carbsGoal);
    const fatChanged = hasGoalChanged(goalInput.fat, currentGoal.fatGoal);

    return calorieChanged || proteinChanged || carbsChanged || fatChanged;
  }, [currentGoal, goalInput]);

  // Refresh methods
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const refreshGoals = useCallback(async () => {
    await fetchGoals();
  }, [fetchGoals]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setProfileError(null);
    setGoalError(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProfile(), fetchGoals()]);
    };
    loadData();
  }, []);

  return {
    // Profile
    profile,
    isLoadingProfile,
    profileError,

    // Goals
    currentGoal,
    allGoals,
    goalInput,
    isLoadingGoals,
    goalError,
    hasGoalChanges: hasGoalChanges(),

    // Combined loading
    isLoading: isLoadingProfile || isLoadingGoals,

    // Profile actions
    updateProfile,
    refreshProfile,

    // Goal actions
    updateGoalInput,
    saveGoal,
    refreshGoals,

    // Utility methods
    getGoalForDate,
    getUnitSystem,
    clearErrors,
  };
}
