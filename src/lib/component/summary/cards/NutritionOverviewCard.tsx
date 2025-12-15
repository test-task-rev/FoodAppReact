import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../core/Card';
import { AppColors } from '../../../theme/colors';

interface NutritionOverviewCardProps {
  calories: number;
  calorieGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
}

interface NutrientColumnProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
}

const NutrientColumn: React.FC<NutrientColumnProps> = ({ label, value, goal, unit, color }) => {
  const percentage = goal > 0 ? (value / goal) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  // Color coding based on percentage
  const getBarColor = () => {
    if (percentage >= 85) return AppColors.success;
    if (percentage >= 70) return AppColors.warning;
    return AppColors.error;
  };

  return (
    <View style={styles.column}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{Math.round(value)}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.goal}>/ {Math.round(goal)}</Text>
      <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${clampedPercentage}%`,
              backgroundColor: getBarColor(),
            },
          ]}
        />
      </View>
    </View>
  );
};

export const NutritionOverviewCard: React.FC<NutritionOverviewCardProps> = ({
  calories,
  calorieGoal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
}) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Nutrition Overview</Text>
      <View style={styles.grid}>
        <NutrientColumn
          label="Calories"
          value={calories}
          goal={calorieGoal}
          unit="cal"
          color={AppColors.warning}
        />
        <NutrientColumn
          label="Protein"
          value={protein}
          goal={proteinGoal}
          unit="g"
          color={AppColors.primary}
        />
        <NutrientColumn
          label="Carbs"
          value={carbs}
          goal={carbsGoal}
          unit="g"
          color={AppColors.success}
        />
        <NutrientColumn label="Fat" value={fat} goal={fatGoal} unit="g" color="#9B59B6" />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.label,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
    marginTop: 2,
  },
  goal: {
    fontSize: 12,
    color: AppColors.tertiaryLabel,
    marginTop: 2,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.label,
    marginTop: 4,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: AppColors.separator,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
