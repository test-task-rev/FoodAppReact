import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { FoodLog } from '../types/FoodLog';
import { MealType } from '../types/MealType';
import { DateTimeUtility } from '../utils/dateTime';
import { API_URLS } from '../config/api';

interface FoodLogResponse {
  logId: string;
  userId: string;
  foodName: string;
  consumedAt: string;
  mealType: string;
  createdAt: string;
  updatedAt: string;
  portion: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

const EMPTY_MEAL_LOGS: Record<MealType, FoodLog[]> = {
  [MealType.Breakfast]: [],
  [MealType.Lunch]: [],
  [MealType.Dinner]: [],
  [MealType.Snack]: [],
};

const parseFoodLog = (raw: FoodLogResponse): FoodLog => {
  return {
    logId: raw.logId,
    userId: raw.userId,
    foodName: raw.foodName,
    consumedAt: DateTimeUtility.fromISO8601(raw.consumedAt),
    mealType: raw.mealType as MealType,
    createdAt: DateTimeUtility.fromISO8601(raw.createdAt),
    updatedAt: DateTimeUtility.fromISO8601(raw.updatedAt),
    portion: raw.portion,
    unit: raw.unit,
    calories: raw.calories,
    protein: raw.protein,
    carbohydrates: raw.carbohydrates,
    fat: raw.fat,
  };
};

const sortByConsumedAt = (logs: FoodLog[]): FoodLog[] => {
  return logs.sort((a, b) => b.consumedAt.getTime() - a.consumedAt.getTime());
};

const groupByMealType = (logs: FoodLog[]): Record<MealType, FoodLog[]> => {
  const grouped: Record<MealType, FoodLog[]> = {
    [MealType.Breakfast]: [],
    [MealType.Lunch]: [],
    [MealType.Dinner]: [],
    [MealType.Snack]: [],
  };

  logs.forEach(log => {
    if (grouped[log.mealType]) {
      grouped[log.mealType].push(log);
    }
  });

  Object.keys(grouped).forEach(key => {
    sortByConsumedAt(grouped[key as MealType]);
  });

  return grouped;
};

const createFoodLogPayload = (foodLog: Partial<FoodLog>) => {
  return {
    foodName: foodLog.foodName!,
    consumedAt: DateTimeUtility.toISO8601(foodLog.consumedAt!),
    mealType: foodLog.mealType!,
    portion: foodLog.portion!,
    unit: foodLog.unit!,
    calories: foodLog.calories!,
    protein: foodLog.protein!,
    carbohydrates: foodLog.carbohydrates!,
    fat: foodLog.fat!,
  };
};

const formatError = (err: unknown, defaultMessage: string): string => {
  return err instanceof Error ? err.message : defaultMessage;
};

export const useFoodLog = () => {
  const api = useApi(API_URLS.FOOD_LOG_SERVICE);
  const [mealLogs, setMealLogs] = useState<Record<MealType, FoodLog[]>>(EMPTY_MEAL_LOGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadMeals = useCallback(async (date: Date): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { start, end } = DateTimeUtility.dayRange(date);
      const startDate = DateTimeUtility.formatDateQuery(start);
      const endDate = DateTimeUtility.formatDateQuery(end);

      const endpoint = `?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;

      const response = await api.get<FoodLogResponse[]>(endpoint);
      const logs = response.map(parseFoodLog);
      const grouped = groupByMealType(logs);

      setMealLogs(grouped);
    } catch (err) {
      setError(formatError(err, 'Failed to load meals'));
      console.error('Failed to load meals:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadMeals(selectedDate);
  }, [selectedDate, loadMeals]);

  const addFoodLog = useCallback(async (foodLog: Omit<FoodLog, 'logId' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FoodLog> => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = createFoodLogPayload(foodLog);
      const response = await api.post<FoodLogResponse>('', payload);
      const newLog = parseFoodLog(response);

      setMealLogs(prev => ({
        ...prev,
        [newLog.mealType]: sortByConsumedAt([...prev[newLog.mealType], newLog]),
      }));

      return newLog;
    } catch (err) {
      setError(formatError(err, 'Failed to add food log'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const deleteFoodLog = useCallback(async (mealType: MealType, logId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/${logId}`);

      setMealLogs(prev => ({
        ...prev,
        [mealType]: prev[mealType].filter(log => log.logId !== logId),
      }));
    } catch (err) {
      setError(formatError(err, 'Failed to delete food log'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const updateFoodLog = useCallback(async (foodLog: FoodLog): Promise<FoodLog> => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = createFoodLogPayload(foodLog);
      const response = await api.put<FoodLogResponse>(
        `/${foodLog.logId}`,
        payload
      );
      const updatedLog = parseFoodLog(response);

      setMealLogs(prev => {
        const updated = { ...prev };

        Object.keys(updated).forEach(key => {
          const mealType = key as MealType;
          updated[mealType] = updated[mealType].filter(
            log => log.logId !== updatedLog.logId
          );
        });

        updated[updatedLog.mealType] = sortByConsumedAt([
          ...updated[updatedLog.mealType],
          updatedLog,
        ]);

        return updated;
      });

      return updatedLog;
    } catch (err) {
      setError(formatError(err, 'Failed to update food log'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const getTotalCalories = (): number => {
    return Object.values(mealLogs)
      .flat()
      .reduce((sum, log) => sum + log.calories, 0);
  };

  const getTotalMacros = () => {
    const all = Object.values(mealLogs).flat();
    return {
      protein: all.reduce((sum, log) => sum + log.protein, 0),
      carbs: all.reduce((sum, log) => sum + log.carbohydrates, 0),
      fat: all.reduce((sum, log) => sum + log.fat, 0),
    };
  };

  const getMealsForType = useCallback((mealType: MealType): FoodLog[] => {
    return mealLogs[mealType];
  }, [mealLogs]);

  const refresh = useCallback(async (): Promise<void> => {
    return loadMeals(selectedDate);
  }, [loadMeals, selectedDate]);

  const clearError = () => {
    setError(null);
  };

  return {
    mealLogs,
    isLoading,
    error,
    selectedDate,
    setSelectedDate,
    addFoodLog,
    deleteFoodLog,
    updateFoodLog,
    getTotalCalories,
    getTotalMacros,
    getMealsForType,
    refresh,
    clearError,
  };
};
