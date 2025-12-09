import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import SecureStorage, { AuthUser } from '../storage/SecureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '../types/Onboarding';
import { API_URLS } from '../config/api';

interface LoginResponse {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  displayName: string;
}

interface SignUpResponse {
  userId: string;
  email: string;
  displayName: string;
  emailVerificationRequired: boolean;
  message: string;
}

interface SignUpRequest {
  email: string;
  password: string;
  displayName: string;
  birthdate: string;
  gender: string;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  goalType: string;
  weightChangeRateKg: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  unitSystem: string;
}

export function useAuth() {
  const api = useApi(API_URLS.USER_SERVICE);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const hasValidSession = await SecureStorage.hasValidSession();

      if (hasValidSession) {
        const storedUser = await SecureStorage.getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatOnboardingData = (data: OnboardingData): Omit<SignUpRequest, 'email' | 'password' | 'displayName'> => {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const mapActivityLevel = (level: string): string => {
      const mapping: Record<string, string> = {
        SEDENTARY: 'SEDENTARY',
        LIGHTLY_ACTIVE: 'LIGHTLY_ACTIVE',
        MODERATELY_ACTIVE: 'MODERATELY_ACTIVE',
        VERY_ACTIVE: 'VERY_ACTIVE',
        EXTREMELY_ACTIVE: 'EXTRA_ACTIVE',
      };
      return mapping[level] || level;
    };

    return {
      birthdate: formatDate(data.birthdate),
      gender: data.gender.toUpperCase(),
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      activityLevel: mapActivityLevel(data.activityLevel),
      goalType: data.goalType.toUpperCase(),
      weightChangeRateKg: data.weightChangeRateKg,
      calorieGoal: data.calorieGoal,
      proteinGoal: data.proteinGoal,
      carbsGoal: data.carbsGoal,
      fatGoal: data.fatGoal,
      unitSystem: data.unitSystem.toUpperCase(),
    };
  };

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post<LoginResponse>('/login', {
          email: email.trim().toLowerCase(),
          password,
        });

        await SecureStorage.saveAuthData({
          token: response.idToken,
          userId: response.userId,
          email: response.email,
          displayName: response.displayName,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });

        await AsyncStorage.setItem('hasLoggedIn', 'true');

        const newUser: AuthUser = {
          userId: response.userId,
          email: response.email,
          displayName: response.displayName,
        };

        setUser(newUser);
        setIsAuthenticated(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Login failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const signUp = useCallback(
    async (
      displayName: string,
      email: string,
      password: string,
      onboardingData: OnboardingData
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const requestData: SignUpRequest = {
          email: email.trim().toLowerCase(),
          password,
          displayName: displayName.trim(),
          ...formatOnboardingData(onboardingData),
        };

        await api.post<SignUpResponse>('/signup', requestData);

        await login(email, password);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api, login]
  );

  const logout = useCallback(async () => {
    try {
      await SecureStorage.clearAuth();
      await AsyncStorage.removeItem('hasLoggedIn');
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    login,
    signUp,
    logout,
    clearError,
  };
}
