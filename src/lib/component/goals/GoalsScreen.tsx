import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CurrentGoalCard } from './CurrentGoalCard';
import { EditGoalCard } from './EditGoalCard';
import { GoalHistorySection } from './GoalHistorySection';
import { useProfile } from '../../hooks/ProfileProvider';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

export const GoalsScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    currentGoal,
    allGoals,
    goalInput,
    isLoadingGoals: isLoading,
    goalError: error,
    hasGoalChanges: hasChanges,
    updateGoalInput,
    saveGoal,
    clearErrors,
  } = useProfile();

  const clearError = () => clearErrors();

  const handleSave = useCallback(async () => {
    try {
      await saveGoal();
      Alert.alert('Success', 'Goals updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    }
  }, [saveGoal, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading || !hasChanges}
          style={styles.saveButton}
        >
          <Text
            style={[
              styles.saveButtonText,
              (isLoading || !hasChanges) && styles.saveButtonTextDisabled,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSave, isLoading, hasChanges]);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  if (isLoading && !currentGoal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CurrentGoalCard goal={currentGoal} />

        <EditGoalCard
          goalInput={goalInput}
          onUpdateGoalInput={updateGoalInput}
          disabled={isLoading}
        />

        <GoalHistorySection goals={allGoals} />

        {isLoading && currentGoal && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color={AppColors.primary} />
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: AppColors.secondaryLabel,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.primary,
  },
  saveButtonTextDisabled: {
    color: AppColors.tertiaryLabel,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  savingText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
  },
});
