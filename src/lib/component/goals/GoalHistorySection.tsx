import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../core/Card';
import { GoalHistoryItem } from './GoalHistoryItem';
import { Goal } from '../../types/Goal';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface GoalHistorySectionProps {
  goals: Goal[];
}

export const GoalHistorySection = memo<GoalHistorySectionProps>(({ goals }) => {
  if (goals.length === 0) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Goals History</Text>
      {goals.map((goal, index) => (
        <GoalHistoryItem
          key={goal.id}
          goal={goal}
          isLast={index === goals.length - 1}
        />
      ))}
    </Card>
  );
});

GoalHistorySection.displayName = 'GoalHistorySection';

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: Spacing.md,
  },
});
