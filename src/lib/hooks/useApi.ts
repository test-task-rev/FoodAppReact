import { useState, useCallback, useMemo } from 'react';
import SecureStorage from '../storage/SecureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REQUEST_TIMEOUT } from '../config/api';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface UseApiReturn {
  request: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, data?: any) => Promise<T>;
  put: <T>(endpoint: string, data?: any) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
}

export function useApi(baseURL: string): UseApiReturn {
  const handleUnauthorized = useCallback(async () => {
    await SecureStorage.clearAuth();
    await AsyncStorage.removeItem('hasLoggedIn');
  }, []);

  const request = useCallback(
    async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const url = `${baseURL}${endpoint}`;
      const token = await SecureStorage.getToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 401 || response.status === 403) {
            await handleUnauthorized();
          }

          throw new APIError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }

        // Handle 204 No Content (DELETE responses typically return this)
        if (response.status === 204) {
          return undefined as T;
        }

        // Only parse JSON if there's content
        const data = await response.json();
        return data;
      } catch (err) {
        clearTimeout(timeoutId);

        if (err instanceof APIError) {
          throw err;
        }

        if ((err as Error).name === 'AbortError') {
          throw new APIError('Request timeout');
        }

        throw new APIError(
          err instanceof Error ? err.message : 'Network request failed'
        );
      }
    },
    [baseURL, handleUnauthorized]
  );

  const get = useCallback(
    <T,>(endpoint: string): Promise<T> => {
      return request<T>(endpoint, { method: 'GET' });
    },
    [request]
  );

  const post = useCallback(
    <T,>(endpoint: string, data?: any): Promise<T> => {
      return request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [request]
  );

  const put = useCallback(
    <T,>(endpoint: string, data?: any): Promise<T> => {
      return request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },
    [request]
  );

  const deleteRequest = useCallback(
    <T,>(endpoint: string): Promise<T> => {
      return request<T>(endpoint, { method: 'DELETE' });
    },
    [request]
  );

  return useMemo(
    () => ({
      request,
      get,
      post,
      put,
      delete: deleteRequest,
    }),
    [request, get, post, put, deleteRequest]
  );
}
