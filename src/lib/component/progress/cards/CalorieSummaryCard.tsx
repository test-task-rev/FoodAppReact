import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../core/Card';
import { AppColors } from '../../../theme/colors';

interface CalorieSummaryCardProps {
  averageCalories: number;
  calorieGoal: number;
}

export const CalorieSummaryCard: React.FC<CalorieSummaryCardProps> = ({
  averageCalories,
  calorieGoal,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>7-Day Average Calories</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{Math.round(averageCalories)}</Text>
        <Text style={styles.unit}>cal</Text>
      </View>
      <View style={styles.goalContainer}>
        <Icon name="target" size={16} color={AppColors.secondaryLabel} />
        <Text style={styles.goalText}>Goal: {calorieGoal} cal</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  label: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  value: {
    fontSize: 44,
    fontWeight: 'bold',
    color: AppColors.label,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.secondaryLabel,
    marginLeft: 8,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goalText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
  },
});
