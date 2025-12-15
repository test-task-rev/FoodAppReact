import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from './useApi';
import { API_URLS } from '../config/api';
import { DateTimeUtility } from '../utils/dateTime';
import { useProfile } from './ProfileProvider';
import {
  DailySummaryData,
  MealBreakdownEntry,
  TopFoodEntry,
  ExerciseSummary,
  ExerciseDetail,
  InsightServiceResponse,
} from '../types/DailySummary';

interface FoodLogResponse {
  logId: string;
  foodName: string;
  portion: number;
  unit: string;
  consumedAt: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  mealType: string;
}

interface ExerciseLogResponse {
  exerciseLogId: string;
  exerciseName: string;
  date: string;
  duration: number;
  calories: number;
}

export const useDailySummary = (initialDate?: Date) => {
  const foodLogApi = useApi(API_URLS.FOOD_LOG_SERVICE);
  const activityApi = useApi(API_URLS.ACTIVITY_SERVICE);
  const insightApi = useApi(API_URLS.INSIGHT_SERVICE);
  const { getGoalForDate } = useProfile();

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [summaryData, setSummaryData] = useState<DailySummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process food logs into meal breakdown and top foods
  const processFoodLogs = useCallback((foodLogs: FoodLogResponse[]) => {
    // Calculate total calories for percentage
    const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);

    // Group by meal type
    const mealGroups = foodLogs.reduce((acc, log) => {
      const mealType = log.mealType;
      if (!acc[mealType]) {
        acc[mealType] = 0;
      }
      acc[mealType] += log.calories;
      return acc;
    }, {} as Record<string, number>);

    // Create meal breakdown array
    const mealBreakdown: MealBreakdownEntry[] = Object.entries(mealGroups).map(
      ([mealType, calories]) => ({
        mealType,
        calories,
        percentage: totalCalories > 0 ? (calories / totalCalories) * 100 : 0,
      })
    );

    // Sort by calories descending, take top 5
    const topFoods: TopFoodEntry[] = foodLogs
      .sort((a, b) => b.calories - a.calories)
      .slice(0, 5)
      .map((log, index) => ({
        rank: index + 1,
        foodName: log.foodName,
        calories: log.calories,
        mealType: log.mealType,
        portion: log.portion,
        unit: log.unit,
      }));

    return { mealBreakdown, topFoods };
  }, []);

  // Process exercise logs into exercise summary
  const processExerciseLogs = useCallback((exerciseLogs: ExerciseLogResponse[]) => {
    if (exerciseLogs.length === 0) {
      return null;
    }

    const totalCaloriesBurned = exerciseLogs.reduce((sum, log) => sum + log.calories, 0);

    const exercises: ExerciseDetail[] = exerciseLogs.map((log) => ({
      exerciseName: log.exerciseName,
      durationMinutes: log.duration,
      caloriesBurned: log.calories,
    }));

    const summary: ExerciseSummary = {
      totalCaloriesBurned,
      exerciseCount: exerciseLogs.length,
      exercises,
    };

    return summary;
  }, []);

  // Load all data with single API call per service
  const loadData = useCallback(
    async (date: Date) => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate date range for the selected day
        const { start, end } = DateTimeUtility.dayRange(date);
        const startDate = DateTimeUtility.formatDateQuery(start);
        const endDate = DateTimeUtility.formatDateQuery(end);

        // Fetch all data in parallel - ONE call per service
        const [insightData, foodLogs, exerciseLogs] = await Promise.all([
          insightApi.get<InsightServiceResponse>(
            `/api/v1/insights/daily?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
          ),
          foodLogApi.get<FoodLogResponse[]>(
            `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
          ),
          activityApi.get<ExerciseLogResponse[]>(
            `/exercise-logs?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
          ),
        ]);

        // Get goal for specific date
        const goal = getGoalForDate(date);

        // Process food logs once into all needed structures
        const { mealBreakdown, topFoods } = processFoodLogs(foodLogs);

        // Process exercise logs
        const exerciseSummary = processExerciseLogs(exerciseLogs);

        // Update state atomically
        setSummaryData({
          aiSummary: insightData.summary || null,
          totalCalories: insightData.totalCalories,
          totalProtein: insightData.totalProtein,
          totalCarbs: insightData.totalCarbs,
          totalFat: insightData.totalFat,
          foodLogCount: insightData.foodLogCount,
          exerciseCount: insightData.exerciseCount,
          mealBreakdown,
          topFoods,
          exerciseSummary,
          goals: {
            calorieGoal: goal?.calorieGoal || 2000,
            proteinGoal: goal?.proteinGoal || 150,
            carbsGoal: goal?.carbsGoal || 200,
            fatGoal: goal?.fatGoal || 65,
          },
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load daily summary';
        setError(errorMessage);
        console.error('Daily summary fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [insightApi, foodLogApi, activityApi, getGoalForDate, processFoodLogs, processExerciseLogs]
  );

  // Load data when selected date changes
  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData(selectedDate);
  }, [loadData, selectedDate]);

  return {
    // Data
    summaryData,
    selectedDate,

    // State
    isLoading,
    error,

    // Actions
    refresh,
    setSelectedDate,
  };
};
