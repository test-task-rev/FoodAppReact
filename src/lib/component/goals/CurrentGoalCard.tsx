import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../core/Card';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { Goal } from '../../types/Goal';

interface CurrentGoalCardProps {
  goal: Goal | null;
}

export const CurrentGoalCard = memo<CurrentGoalCardProps>(({ goal }) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.subtitle}>Current Goal</Text>
      {goal?.calorieGoal ? (
        <View style={styles.goalContainer}>
          <Text style={styles.goalValue}>{Math.round(goal.calorieGoal)}</Text>
          <Text style={styles.goalUnit}>calories/day</Text>
        </View>
      ) : (
        <Text style={styles.noGoal}>No goal set</Text>
      )}
    </Card>
  );
});

CurrentGoalCard.displayName = 'CurrentGoalCard';

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: AppColors.secondaryLabel,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  goalValue: {
    fontSize: 44,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  goalUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.secondaryLabel,
  },
  noGoal: {
    fontSize: 16,
    color: AppColors.secondaryLabel,
    paddingVertical: Spacing.md,
  },
});
