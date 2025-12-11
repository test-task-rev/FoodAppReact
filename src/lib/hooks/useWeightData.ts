import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { WeightEntry } from '../types/WeightEntry';
import { DateTimeUtility } from '../utils/dateTime';
import { API_URLS } from '../config/api';

interface WeightResponse {
  id: number;
  userId: string;
  weightKg: number;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

const parseWeightEntry = (raw: WeightResponse): WeightEntry => {
  return {
    id: raw.id,
    weight: raw.weightKg,
    date: DateTimeUtility.fromISO8601(raw.recordedAt),
  };
};

const createWeightPayload = (weight: number, date: Date) => {
  return {
    weightKg: weight,
    recordedAt: DateTimeUtility.toISO8601(date),
  };
};

const formatError = (err: unknown, defaultMessage: string): string => {
  return err instanceof Error ? err.message : defaultMessage;
};

export const useWeightData = () => {
  const api = useApi(API_URLS.USER_SERVICE);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeightData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<WeightResponse[]>('/weights');
      const entries = response.map(parseWeightEntry);

      const sorted = entries.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setWeightEntries(sorted);
    } catch (err) {
      setError(formatError(err, 'Failed to load weight data'));
      console.error('Failed to load weight data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadWeightData();
  }, [loadWeightData]);

  const addWeightEntry = useCallback(async (weight: number, date: Date): Promise<WeightEntry> => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = createWeightPayload(weight, date);
      const response = await api.post<WeightResponse>('/weight', payload);
      const newEntry = parseWeightEntry(response);

      setWeightEntries(prevEntries => {
        const updated = [newEntry, ...prevEntries];
        return updated.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      return newEntry;
    } catch (err) {
      setError(formatError(err, 'Failed to add weight entry'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);
  
  const getLatestWeight = useCallback((): WeightEntry | null => {
    return weightEntries.length > 0 ? weightEntries[0] : null;
  }, [weightEntries]);

  const getWeightForPeriod = useCallback((days: number): WeightEntry[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return weightEntries
      .filter(entry => new Date(entry.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weightEntries]);

  const getWeightChange = useCallback((days: number): number | null => {
    const entries = getWeightForPeriod(days);
    if (entries.length < 2) return null;

    const first = entries[0];
    const last = entries[entries.length - 1];
    return last.weight - first.weight;
  }, [getWeightForPeriod]);

  const refresh = useCallback(async (): Promise<void> => {
    return loadWeightData();
  }, [loadWeightData]);

  const clearError = () => {
    setError(null);
  };

  return {
    weightEntries,
    isLoading,
    error,
    addWeightEntry,
    getLatestWeight,
    getWeightForPeriod,
    getWeightChange,
    refresh,
    clearError,
  };
};
