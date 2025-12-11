import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { API_URLS } from '../config/api';
import { UserProfile, UpdateProfileRequest } from '../types/UserProfile';
import { Gender, ActivityLevel, UnitSystem } from '../types/Onboarding';
import SecureStorage from '../storage/SecureStorage';

export function useProfile() {
  const api = useApi(API_URLS.USER_SERVICE);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await SecureStorage.getUser();
      if (!user?.userId) {
        throw new Error('User not authenticated');
      }

      const response = await api.get<UserProfile>('/profile');
      setProfile(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const updateProfile = useCallback(
    async (updates: UpdateProfileRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const user = await SecureStorage.getUser();
        if (!user?.userId) {
          throw new Error('User not authenticated');
        }

        const response = await api.put<UserProfile>('/profile', updates);
        setProfile(response);

        // Update local user data if displayName changed
        if (updates.displayName !== user.displayName) {
          await SecureStorage.saveUser({
            ...user,
            displayName: updates.displayName,
          });
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  };
}

// Utility functions for parsing backend strings to enums
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
