import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../../context/OnboardingContext';
import { OnboardingStep } from '../../types/Onboarding';
import { AuthStackParamList } from '../../../App';

// Import implemented step components
import { UserProfileStep } from './UserProfileStep';
import { ActivityLevelStep } from './ActivityLevelStep';
import { GoalStep } from './GoalStep';
import { SummaryStep } from './SummaryStep';
import { AccountStep } from './AccountStep';

type OnboardingNavigatorProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
};

const STEP_TITLES = {
  [OnboardingStep.BASIC_INFO]: 'User Profile',
  [OnboardingStep.ACTIVITY]: 'Activity Level',
  [OnboardingStep.GOAL]: 'Your Goals',
  [OnboardingStep.SUMMARY]: 'Review',
  [OnboardingStep.ACCOUNT]: 'Create Account',
};

export const OnboardingNavigator: React.FC<OnboardingNavigatorProps> = ({
  navigation,
}) => {
  const { state, dispatch } = useOnboarding();
  const { currentStep } = state;

  const canGoBack = currentStep > OnboardingStep.BASIC_INFO;

  const handleBack = () => {
    if (canGoBack) {
      dispatch({ type: 'PREVIOUS_STEP' });
    } else {
      navigation.goBack();
    }
  };

  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.BASIC_INFO:
        return <UserProfileStep />;

      case OnboardingStep.ACTIVITY:
        return <ActivityLevelStep />;

      case OnboardingStep.GOAL:
        return <GoalStep />;

      case OnboardingStep.SUMMARY:
        return <SummaryStep />;

      case OnboardingStep.ACCOUNT:
        return <AccountStep navigation={navigation} />;

      default:
        return null;
    }
  };

  // Progress calculation (5 steps total: User Profile, Activity, Goal, Summary, Account)
  const stepIndex = currentStep === OnboardingStep.BASIC_INFO ? 0 : currentStep - 1;
  const progress = ((stepIndex + 1) / 5) * 100;

  // Check if current step needs the bottom Continue button
  const needsContinueButton =
    currentStep === OnboardingStep.BASIC_INFO ||
    currentStep === OnboardingStep.ACTIVITY ||
    currentStep === OnboardingStep.GOAL ||
    currentStep === OnboardingStep.SUMMARY;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{STEP_TITLES[currentStep]}</Text>
          <Text style={styles.headerSubtitle}>
            Step {stepIndex + 1} of 5
          </Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Step Content */}
      <View style={styles.content}>{renderStep()}</View>

      {/* Continue Button (for steps that need it) */}
      {needsContinueButton && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  continueButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
