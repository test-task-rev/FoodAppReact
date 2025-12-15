import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { API_URLS } from '../config/api';
import { DateTimeUtility } from '../utils/dateTime';
import {
  DailyCalorieEntry,
  DailyMacroEntry,
  DailyActivityEntry,
  UserGoals,
  ProgressStats,
  CaloriePeriod,
} from '../types/Progress';

interface FoodLogResponse {
  logId: string;
  consumedAt: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

interface ExerciseLogResponse {
  exerciseLogId: string;
  date: string;
  calories: number;
}

interface GoalResponse {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

export const useProgressData = () => {
  const foodLogApi = useApi(API_URLS.FOOD_LOG_SERVICE);
  const activityApi = useApi(API_URLS.ACTIVITY_SERVICE);
  const userApi = useApi(API_URLS.USER_SERVICE);

  // State
  const [calorieEntries, setCalorieEntries] = useState<DailyCalorieEntry[]>([]);
  const [macroEntries, setMacroEntries] = useState<DailyMacroEntry[]>([]);
  const [activityEntries, setActivityEntries] = useState<DailyActivityEntry[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoals>({
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 200,
    fatGoal: 65,
  });
  const [stats, setStats] = useState<ProgressStats>({
    averageCalories: 0,
    loggingStreak: 0,
    mealsLastWeek: 0,
  });
  const [selectedPeriod, setSelectedPeriod] = useState<CaloriePeriod>(CaloriePeriod.ThirtyDays);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user goals
  const fetchUserGoals = useCallback(async (): Promise<UserGoals> => {
    const response = await userApi.get<GoalResponse>('/goal');
    return {
      calorieGoal: response.calorieGoal,
      proteinGoal: response.proteinGoal,
      carbsGoal: response.carbsGoal,
      fatGoal: response.fatGoal,
    };
  }, [userApi]);

  // Calculate logging streak
  const calculateLoggingStreak = useCallback(async (): Promise<number> => {
    let streak = 0;
    let currentDate = new Date();
    const maxDays = 365;

    for (let i = 0; i < maxDays; i++) {
      const { start, end } = DateTimeUtility.dayRange(currentDate);
      const startDate = DateTimeUtility.formatDateQuery(start);
      const endDate = DateTimeUtility.formatDateQuery(end);

      try {
        const logs = await foodLogApi.get<FoodLogResponse[]>(
          `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
        );

        if (logs.length === 0) break;

        streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } catch (err) {
        break;
      }
    }

    return streak;
  }, [foodLogApi]);

  // Process food logs into all needed data structures
  const processFoodLogs = useCallback(
    (foodLogs: FoodLogResponse[], goals: UserGoals) => {
      // Group by date
      const grouped = foodLogs.reduce((acc, log) => {
        const date = DateTimeUtility.fromISO8601(log.consumedAt);
        const dateKey = date.toISOString().split('T')[0];

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: new Date(dateKey),
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            mealCount: 0,
          };
        }

        acc[dateKey].calories += log.calories;
        acc[dateKey].protein += log.protein;
        acc[dateKey].carbs += log.carbohydrates;
        acc[dateKey].fat += log.fat;
        acc[dateKey].mealCount += 1;

        return acc;
      }, {} as Record<string, { date: Date; calories: number; protein: number; carbs: number; fat: number; mealCount: number }>);

      const sortedEntries = Object.values(grouped).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      // Create calorie entries
      const calories: DailyCalorieEntry[] = sortedEntries.map((entry) => ({
        date: entry.date,
        totalCalories: entry.calories,
      }));

      // Create macro entries
      const macros: DailyMacroEntry[] = sortedEntries.map((entry) => ({
        date: entry.date,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        proteinGoal: goals.proteinGoal,
        carbsGoal: goals.carbsGoal,
        fatGoal: goals.fatGoal,
      }));

      return { calories, macros, grouped };
    },
    []
  );

  // Process exercise logs
  const processExerciseLogs = useCallback((exerciseLogs: ExerciseLogResponse[]) => {
    return exerciseLogs.reduce((acc, log) => {
      const date = DateTimeUtility.fromISO8601(log.date);
      const dateKey = date.toISOString().split('T')[0];

      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += log.calories;

      return acc;
    }, {} as Record<string, number>);
  }, []);

  // Combine food and exercise data into activity entries
  const createActivityEntries = useCallback(
    (
      foodGrouped: Record<string, { date: Date; calories: number; mealCount: number }>,
      exerciseGrouped: Record<string, number>
    ): DailyActivityEntry[] => {
      const allDates = new Set([...Object.keys(foodGrouped), ...Object.keys(exerciseGrouped)]);

      const entries: DailyActivityEntry[] = Array.from(allDates).map((dateKey) => ({
        date: new Date(dateKey),
        caloriesConsumed: foodGrouped[dateKey]?.calories ?? 0,
        mealsLogged: foodGrouped[dateKey]?.mealCount ?? 0,
        caloriesBurned: exerciseGrouped[dateKey] ?? 0,
      }));

      return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
    },
    []
  );

  // Calculate average calories
  const calculateAverageCalories = useCallback(
    (entries: DailyCalorieEntry[], days: number = 7): number => {
      const recent = entries.slice(-Math.min(days, entries.length));
      if (recent.length === 0) return 0;
      const total = recent.reduce((sum, entry) => sum + entry.totalCalories, 0);
      return total / recent.length;
    },
    []
  );

  // Load all data with single API call per service
  const loadData = useCallback(
    async (period: CaloriePeriod) => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate date range once
        const { start, end } = calculateDateRange(period);
        const startDate = DateTimeUtility.formatDateQuery(start);
        const endDate = DateTimeUtility.formatDateQuery(end);

        // Fetch all data in parallel - ONE call per service
        const [goals, foodLogs, exerciseLogs, streak] = await Promise.all([
          fetchUserGoals(),
          foodLogApi.get<FoodLogResponse[]>(
            `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
          ),
          activityApi.get<ExerciseLogResponse[]>(
            `/exercise-logs?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
          ),
          calculateLoggingStreak(),
        ]);

        // Process food logs once into all needed structures
        const { calories, macros, grouped: foodGrouped } = processFoodLogs(foodLogs, goals);

        // Process exercise logs
        const exerciseGrouped = processExerciseLogs(exerciseLogs);

        // Create activity entries by combining food and exercise
        const activity = createActivityEntries(
          foodGrouped as Record<string, { date: Date; calories: number; mealCount: number }>,
          exerciseGrouped
        );

        // Calculate stats
        const averageCalories = calculateAverageCalories(calories, 7);
        const mealsLastWeek = activity
          .slice(-7)
          .reduce((sum, entry) => sum + entry.mealsLogged, 0);

        // Update state once
        setUserGoals(goals);
        setCalorieEntries(calories);
        setMacroEntries(macros);
        setActivityEntries(activity);
        setStats({
          averageCalories,
          loggingStreak: streak,
          mealsLastWeek,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load progress data';
        setError(errorMessage);
        console.error('Progress data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchUserGoals,
      foodLogApi,
      activityApi,
      calculateLoggingStreak,
      processFoodLogs,
      processExerciseLogs,
      createActivityEntries,
      calculateAverageCalories,
    ]
  );

  // Load data when period changes
  useEffect(() => {
    loadData(selectedPeriod);
  }, [selectedPeriod]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData(selectedPeriod);
  }, [loadData, selectedPeriod]);

  return {
    // Data
    calorieEntries,
    macroEntries,
    activityEntries,
    userGoals,
    stats,
    selectedPeriod,

    // State
    isLoading,
    error,

    // Actions
    setSelectedPeriod,
    refresh,
  };
};

// Helper function
const calculateDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
};
