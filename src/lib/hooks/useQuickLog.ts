import { useState, useCallback } from 'react';
import { useFoodLog } from './useFoodLog';
import type { MealType } from '../types/MealType';
import type { FoodLog } from '../types/FoodLog';

interface QuickLogFormData {
  foodName: string;
  portionGrams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

interface UseQuickLogOptions {
  mealType: MealType;
  date: Date;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  existingLog?: FoodLog;
}

export const useQuickLog = ({ mealType, date, onSuccess, onError, existingLog }: UseQuickLogOptions) => {
  const { addFoodLog, updateFoodLog } = useFoodLog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!existingLog;

  const submitQuickLog = useCallback(async (data: QuickLogFormData) => {
    setIsSubmitting(true);

    try {
      if (isEditMode && existingLog) {
        // Update existing log
        await updateFoodLog({
          ...existingLog,
          foodName: data.foodName,
          portion: data.portionGrams,
          unit: 'grams',
          calories: data.calories,
          protein: data.protein,
          carbohydrates: data.carbohydrates,
          fat: data.fat,
        });
      } else {
        // Create new log
        await addFoodLog({
          foodName: data.foodName,
          consumedAt: date,
          mealType,
          portion: data.portionGrams,
          unit: 'grams',
          calories: data.calories,
          protein: data.protein,
          carbohydrates: data.carbohydrates,
          fat: data.fat,
        });
      }

      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [mealType, date, addFoodLog, updateFoodLog, onSuccess, onError, isEditMode, existingLog]);

  return {
    submitQuickLog,
    isSubmitting,
  };
};
