import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../core/Card';
import { AppColors } from '../../../theme/colors';
import { ExerciseSummary, ExerciseDetail } from '../../../types/DailySummary';

interface ExerciseSummaryCardProps {
  summary: ExerciseSummary | null;
}

interface ExerciseRowProps {
  exercise: ExerciseDetail;
}

const ExerciseRow: React.FC<ExerciseRowProps> = ({ exercise }) => {
  return (
    <View style={styles.row}>
      <Icon name="dumbbell" size={16} color={AppColors.success} />
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        <Text style={styles.duration}>{exercise.durationMinutes} min</Text>
      </View>
      <Text style={styles.calories}>{Math.round(exercise.caloriesBurned)} cal</Text>
    </View>
  );
};

export const ExerciseSummaryCard: React.FC<ExerciseSummaryCardProps> = ({ summary }) => {
  if (!summary || summary.exerciseCount === 0) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Icon name="run" size={20} color={AppColors.success} />
        <Text style={styles.title}>Exercise Summary</Text>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalValue}>{Math.round(summary.totalCaloriesBurned)}</Text>
        <Text style={styles.totalLabel}>calories burned</Text>
      </View>

      <View style={styles.exerciseList}>
        {summary.exercises.map((exercise, index) => (
          <ExerciseRow key={index} exercise={exercise} />
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  totalContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.separator,
    marginBottom: 16,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: AppColors.success,
    fontVariant: ['tabular-nums'],
  },
  totalLabel: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    marginTop: 4,
  },
  exerciseList: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
  },
  duration: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
    marginTop: 2,
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.success,
    fontVariant: ['tabular-nums'],
  },
});
