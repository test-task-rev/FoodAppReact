import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  OnboardingState,
  OnboardingData,
  OnboardingStep,
  Gender,
  ActivityLevel,
  GoalType,
  UnitSystem,
} from '../types/Onboarding';
import { DEFAULT_GOALS } from '../theme/constants';

// Action types
type OnboardingAction =
  | { type: 'SET_UNIT_SYSTEM'; payload: UnitSystem }
  | { type: 'SET_BIRTHDATE'; payload: Date }
  | { type: 'SET_GENDER'; payload: Gender }
  | { type: 'SET_HEIGHT'; payload: number }
  | { type: 'SET_WEIGHT'; payload: number }
  | { type: 'SET_ACTIVITY_LEVEL'; payload: ActivityLevel }
  | { type: 'SET_GOAL_TYPE'; payload: GoalType }
  | { type: 'SET_WEIGHT_CHANGE_RATE'; payload: number }
  | { type: 'SET_DISPLAY_NAME'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_CALORIE_GOAL'; payload: number }
  | { type: 'SET_PROTEIN_GOAL'; payload: number }
  | { type: 'SET_CARBS_GOAL'; payload: number }
  | { type: 'SET_FAT_GOAL'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GOTO_STEP'; payload: OnboardingStep }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET' };

// Initial state
const initialData: OnboardingData = {
  unitSystem: UnitSystem.METRIC,
  birthdate: new Date(new Date().setFullYear(new Date().getFullYear() - 25)),
  gender: Gender.MALE,
  heightCm: 175,
  weightKg: 70,
  activityLevel: ActivityLevel.MODERATELY_ACTIVE,
  goalType: GoalType.MAINTAIN_WEIGHT,
  weightChangeRateKg: 0,
  displayName: '',
  email: '',
  calorieGoal: DEFAULT_GOALS.CALORIES,
  proteinGoal: DEFAULT_GOALS.PROTEIN,
  carbsGoal: DEFAULT_GOALS.CARBS,
  fatGoal: DEFAULT_GOALS.FAT,
};

const initialState: OnboardingState = {
  currentStep: OnboardingStep.BASIC_INFO,
  data: initialData,
  isComplete: false,
};

// Reducer
const onboardingReducer = (
  state: OnboardingState,
  action: OnboardingAction
): OnboardingState => {
  switch (action.type) {
    case 'SET_UNIT_SYSTEM':
      return {
        ...state,
        data: { ...state.data, unitSystem: action.payload },
      };

    case 'SET_BIRTHDATE':
      return {
        ...state,
        data: { ...state.data, birthdate: action.payload },
      };

    case 'SET_GENDER':
      return {
        ...state,
        data: { ...state.data, gender: action.payload },
      };

    case 'SET_HEIGHT':
      return {
        ...state,
        data: { ...state.data, heightCm: action.payload },
      };

    case 'SET_WEIGHT':
      return {
        ...state,
        data: { ...state.data, weightKg: action.payload },
      };

    case 'SET_ACTIVITY_LEVEL':
      return {
        ...state,
        data: { ...state.data, activityLevel: action.payload },
      };

    case 'SET_GOAL_TYPE':
      return {
        ...state,
        data: { ...state.data, goalType: action.payload },
      };

    case 'SET_WEIGHT_CHANGE_RATE':
      return {
        ...state,
        data: { ...state.data, weightChangeRateKg: action.payload },
      };

    case 'SET_DISPLAY_NAME':
      return {
        ...state,
        data: { ...state.data, displayName: action.payload },
      };

    case 'SET_EMAIL':
      return {
        ...state,
        data: { ...state.data, email: action.payload },
      };

    case 'SET_CALORIE_GOAL':
      return {
        ...state,
        data: { ...state.data, calorieGoal: action.payload },
      };

    case 'SET_PROTEIN_GOAL':
      return {
        ...state,
        data: { ...state.data, proteinGoal: action.payload },
      };

    case 'SET_CARBS_GOAL':
      return {
        ...state,
        data: { ...state.data, carbsGoal: action.payload },
      };

    case 'SET_FAT_GOAL':
      return {
        ...state,
        data: { ...state.data, fatGoal: action.payload },
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(
          state.currentStep + 1,
          OnboardingStep.ACCOUNT
        ) as OnboardingStep,
      };

    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(
          state.currentStep - 1,
          OnboardingStep.BASIC_INFO
        ) as OnboardingStep,
      };

    case 'GOTO_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isComplete: true,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

// Context
interface OnboardingContextValue {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

// Provider
interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Hook
export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }

  return context;
};
