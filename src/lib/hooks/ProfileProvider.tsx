import React, { createContext, useContext, ReactNode } from 'react';
import { useProfileState } from './useProfileState';
import { UserProfile, UpdateProfileRequest } from '../types/UserProfile';
import { Goal, GoalInput, CreateGoalRequest } from '../types/Goal';
import { UnitSystem } from '../types/Onboarding';

interface ProfileContextValue {
  // Profile
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  profileError: string | null;

  // Goals
  currentGoal: Goal | null;
  allGoals: Goal[];
  goalInput: GoalInput;
  isLoadingGoals: boolean;
  goalError: string | null;
  hasGoalChanges: boolean;

  // Combined loading state
  isLoading: boolean;

  // Profile actions
  updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Goal actions
  updateGoalInput: (field: keyof GoalInput, value: string) => void;
  saveGoal: () => Promise<void>;
  refreshGoals: () => Promise<void>;

  // Utility methods
  getGoalForDate: (date: Date) => Goal | null;
  getUnitSystem: () => UnitSystem;
  clearErrors: () => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const profileState = useProfileState();

  return (
    <ProfileContext.Provider value={profileState}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);

  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }

  return context;
}
