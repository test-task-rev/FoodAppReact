import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { ExerciseLog, ExerciseLogResponse } from '../types/ExerciseLog';
import { DateTimeUtility } from '../utils/dateTime';
import { API_URLS } from '../config/api';

// Parse backend response to domain model
const parseExerciseLog = (raw: ExerciseLogResponse): ExerciseLog => {
  return {
    logId: raw.logId,
    userId: raw.userId,
    exerciseId: raw.exerciseId,
    exerciseName: raw.exerciseName,
    duration: raw.duration,
    calories: raw.calories,
    date: DateTimeUtility.fromISO8601(raw.date),
    createdAt: raw.createdAt ? DateTimeUtility.fromISO8601(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? DateTimeUtility.fromISO8601(raw.updatedAt) : undefined,
  };
};

// Create payload for backend from domain model
const createExercisePayload = (log: {
  exerciseId?: string;
  exerciseName: string;
  duration: number;
  calories: number;
  date: Date;
}) => {
  return {
    exerciseId: log.exerciseId,
    exerciseName: log.exerciseName,
    duration: log.duration,
    calories: log.calories,
    date: DateTimeUtility.toISO8601(log.date),
  };
};

const formatError = (err: unknown, defaultMessage: string): string => {
  return err instanceof Error ? err.message : defaultMessage;
};

interface UseExerciseDataProps {
  selectedDate: Date;
}

export const useExerciseData = ({ selectedDate }: UseExerciseDataProps) => {
  const api = useApi(API_URLS.ACTIVITY_SERVICE);
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load exercise logs for a specific date range
   */
  const loadExercises = useCallback(
    async (startDate: Date, endDate: Date): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams({
          startDate: DateTimeUtility.toISO8601(startDate),
          endDate: DateTimeUtility.toISO8601(endDate),
        });

        const response = await api.get<ExerciseLogResponse[]>(
          `/exercise-logs?${params.toString()}`
        );

        const logs = response.map(parseExerciseLog);

        // Sort by date descending (most recent first)
        const sorted = logs.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );

        setExercises(sorted);
      } catch (err) {
        setError(formatError(err, 'Failed to load exercises'));
        console.error('Failed to load exercises:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  /**
   * Load exercises for the selected date
   */
  const loadExercisesForSelectedDate = useCallback(async (): Promise<void> => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    await loadExercises(startOfDay, endOfDay);
  }, [selectedDate, loadExercises]);

  // Auto-reload exercises when selected date changes
  useEffect(() => {
    loadExercisesForSelectedDate();
  }, [loadExercisesForSelectedDate]);

  /**
   * Add a new exercise log
   */
  const addExercise = useCallback(
    async (
      exerciseName: string,
      durationMinutes: number,
      caloriesBurned: number,
      date: Date = new Date()
    ): Promise<ExerciseLog> => {
      setIsLoading(true);
      setError(null);

      try {
        const payload = createExercisePayload({
          exerciseName,
          duration: durationMinutes,
          calories: caloriesBurned,
          date,
        });

        const response = await api.post<ExerciseLogResponse>(
          '/exercise-logs',
          payload
        );

        const newLog = parseExerciseLog(response);

        // Optimistically update state with functional update to avoid stale closure
        setExercises((prevExercises) => {
          const updated = [newLog, ...prevExercises];
          return updated.sort((a, b) => b.date.getTime() - a.date.getTime());
        });

        return newLog;
      } catch (err) {
        setError(formatError(err, 'Failed to add exercise'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  /**
   * Delete an exercise log
   */
  const deleteExercise = useCallback(
    async (exercise: ExerciseLog): Promise<void> => {
      if (!exercise.logId) {
        throw new Error('Cannot delete exercise: logId is missing');
      }

      setIsLoading(true);
      setError(null);

      try {
        await api.delete(`/exercise-logs/${exercise.logId}`);

        // Optimistically remove from state
        setExercises((prevExercises) =>
          prevExercises.filter((e) => e.logId !== exercise.logId)
        );
      } catch (err) {
        setError(formatError(err, 'Failed to delete exercise'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  /**
   * Get total calories burned (for current exercises in state)
   */
  const getTotalCaloriesBurned = useCallback((): number => {
    return exercises.reduce((sum, exercise) => sum + exercise.calories, 0);
  }, [exercises]);

  /**
   * Refresh exercises for selected date
   */
  const refresh = useCallback(async (): Promise<void> => {
    return loadExercisesForSelectedDate();
  }, [loadExercisesForSelectedDate]);

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  return {
    exercises,
    isLoading,
    error,
    addExercise,
    deleteExercise,
    getTotalCaloriesBurned,
    refresh,
    clearError,
  };
};
