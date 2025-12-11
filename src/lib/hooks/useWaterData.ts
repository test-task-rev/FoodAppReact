import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { WaterLog } from '../types/WaterLog';
import { DateTimeUtility } from '../utils/dateTime';
import { API_URLS } from '../config/api';
import { DEFAULT_GOALS } from '../theme/constants';

interface WaterLogResponse {
  logId: string;
  userId: string;
  amount: number;
  consumedAt: string;
  createdAt: string;
  updatedAt: string;
}

const parseWaterLog = (raw: WaterLogResponse): WaterLog => {
  return {
    logId: raw.logId,
    userId: raw.userId,
    amount: raw.amount,
    consumedAt: DateTimeUtility.fromISO8601(raw.consumedAt),
    createdAt: DateTimeUtility.fromISO8601(raw.createdAt),
    updatedAt: DateTimeUtility.fromISO8601(raw.updatedAt),
  };
};

const createWaterLogPayload = (amount: number, consumedAt: Date) => {
  return {
    amount,
    consumedAt: DateTimeUtility.toISO8601(consumedAt),
  };
};

const formatError = (err: unknown, defaultMessage: string): string => {
  return err instanceof Error ? err.message : defaultMessage;
};

interface UseWaterDataProps {
  selectedDate: Date;
}

export const useWaterData = ({ selectedDate }: UseWaterDataProps) => {
  const api = useApi(API_URLS.WATER_LOG_SERVICE);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const waterGoal = DEFAULT_GOALS.WATER;

  const loadWaterData = useCallback(async (date: Date): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { start, end } = DateTimeUtility.dayRange(date);
      const startDate = DateTimeUtility.formatDateQuery(start);
      const endDate = DateTimeUtility.formatDateQuery(end);

      const endpoint = `?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;

      const response = await api.get<WaterLogResponse[]>(endpoint);
      const logs = response.map(parseWaterLog);

      // Sort by consumedAt descending (newest first)
      const sorted = logs.sort((a, b) =>
        b.consumedAt.getTime() - a.consumedAt.getTime()
      );

      setWaterLogs(sorted);
    } catch (err) {
      setError(formatError(err, 'Failed to load water logs'));
      console.error('Failed to load water logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadWaterData(selectedDate);
  }, [selectedDate, loadWaterData]);

  const addWater = useCallback(async (amount: number, consumedAt: Date): Promise<WaterLog> => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = createWaterLogPayload(amount, consumedAt);
      const response = await api.post<WaterLogResponse>('', payload);
      const newLog = parseWaterLog(response);

      setWaterLogs(prev => {
        const updated = [newLog, ...prev];
        return updated.sort((a, b) =>
          b.consumedAt.getTime() - a.consumedAt.getTime()
        );
      });

      return newLog;
    } catch (err) {
      setError(formatError(err, 'Failed to add water log'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const removeLastLog = useCallback(async (): Promise<void> => {
    if (waterLogs.length === 0) return;

    setIsLoading(true);
    setError(null);

    const lastLog = waterLogs[0]; // First item is newest due to sorting

    try {
      await api.delete(`/${lastLog.logId}`);

      setWaterLogs(prev => prev.filter(log => log.logId !== lastLog.logId));
    } catch (err) {
      setError(formatError(err, 'Failed to remove water log'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api, waterLogs]);

  const deleteWaterLog = useCallback(async (logId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await api.delete(`/${logId}`);

      setWaterLogs(prev => prev.filter(log => log.logId !== logId));
    } catch (err) {
      setError(formatError(err, 'Failed to delete water log'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const waterConsumed = waterLogs.reduce((sum, log) => sum + log.amount, 0);

  const getWaterProgress = useCallback((): number => {
    return Math.min(1.0, waterConsumed / waterGoal);
  }, [waterConsumed, waterGoal]);

  const getWaterRemaining = useCallback((): number => {
    return Math.max(0, waterGoal - waterConsumed);
  }, [waterGoal, waterConsumed]);

  const refresh = useCallback(async (): Promise<void> => {
    return loadWaterData(selectedDate);
  }, [loadWaterData, selectedDate]);

  const clearError = () => {
    setError(null);
  };

  return {
    waterLogs,
    waterConsumed,
    waterGoal,
    isLoading,
    error,
    addWater,
    removeLastLog,
    deleteWaterLog,
    getWaterProgress,
    getWaterRemaining,
    refresh,
    clearError,
  };
};
