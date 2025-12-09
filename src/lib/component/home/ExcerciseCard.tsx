import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card } from '../core/Card';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { ExerciseLog } from '../../types/ExerciseLog';

interface ExerciseCardProps {
  exercises?: ExerciseLog[];
  onAddExercise: () => void;
  onDeleteExercise?: (exercise: ExerciseLog) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercises = [],
  onAddExercise,
  onDeleteExercise,
}) => {
  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Exercise</Text>
        <TouchableOpacity onPress={onAddExercise} style={styles.addButton}>
          <Icon name="add-circle" size={28} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      {exercises.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="barbell-outline" size={48} color={AppColors.secondaryLabel} />
          <Text style={styles.emptyText}>No exercises recorded</Text>
        </View>
      ) : (
        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <View key={exercise.logId} style={styles.exerciseItem}>
              <View style={styles.exerciseLeft}>
                <Icon name="barbell" size={20} color={AppColors.primary} />
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                  <Text style={styles.exerciseDuration}>
                    {exercise.duration} min
                  </Text>
                </View>
              </View>

              <View style={styles.exerciseRight}>
                <Text style={styles.caloriesText}>
                  {Math.round(exercise.calories)} cal
                </Text>
                {onDeleteExercise && (
                  <TouchableOpacity
                    onPress={() => onDeleteExercise(exercise)}
                    style={styles.deleteButton}
                  >
                    <Icon name="trash-outline" size={18} color={AppColors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
  },
  addButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: AppColors.secondaryLabel,
  },
  exerciseList: {
    gap: Spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.separator,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '500',
    color: AppColors.label,
  },
  exerciseDuration: {
    fontSize: 13,
    color: AppColors.secondaryLabel,
  },
  exerciseRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.label,
  },
  deleteButton: {
    padding: 4,
  },
});
