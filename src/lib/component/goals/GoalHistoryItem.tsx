import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Goal } from '../../types/Goal';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface GoalHistoryItemProps {
  goal: Goal;
  isLast: boolean;
}

const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const GoalHistoryItem = memo<GoalHistoryItemProps>(({ goal, isLast }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.date}>{formatDate(goal.createdAt)}</Text>

      <View style={styles.macrosContainer}>
        {goal.calorieGoal && (
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Calories</Text>
            <Text style={styles.macroValue}>{Math.round(goal.calorieGoal)}</Text>
          </View>
        )}

        {goal.proteinGoal && (
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>{Math.round(goal.proteinGoal)}g</Text>
          </View>
        )}

        {goal.carbsGoal && (
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>{Math.round(goal.carbsGoal)}g</Text>
          </View>
        )}

        {goal.fatGoal && (
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>{Math.round(goal.fatGoal)}g</Text>
          </View>
        )}
      </View>

      {!isLast && <View style={styles.divider} />}
    </View>
  );
});

GoalHistoryItem.displayName = 'GoalHistoryItem';

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
  },
  date: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
    marginBottom: Spacing.xs,
  },
  macrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  macroItem: {
    gap: 2,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: AppColors.tertiaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.separator,
    marginTop: Spacing.sm,
  },
});
