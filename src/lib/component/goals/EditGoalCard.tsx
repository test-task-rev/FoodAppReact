import React, { memo, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../core/Card';
import { GoalInputField } from './GoalInputField';
import { GoalInput } from '../../types/Goal';
import { validateCalorieInput, validateMacroInput } from '../../validators/goalRules';
import { Spacing } from '../../theme/spacing';
import { AppColors } from '../../theme/colors';

interface EditGoalCardProps {
  goalInput: GoalInput;
  onUpdateGoalInput: (field: keyof GoalInput, value: string) => void;
  disabled?: boolean;
}

export const EditGoalCard = memo<EditGoalCardProps>(({
  goalInput,
  onUpdateGoalInput,
  disabled = false,
}) => {
  const [errors, setErrors] = useState<Partial<GoalInput>>({});

  const handleCalorieChange = useCallback((value: string) => {
    onUpdateGoalInput('calories', value);
    const error = validateCalorieInput(value);
    setErrors(prev => ({ ...prev, calories: error || '' }));
  }, [onUpdateGoalInput]);

  const handleProteinChange = useCallback((value: string) => {
    onUpdateGoalInput('protein', value);
    const error = validateMacroInput(value, 'Protein');
    setErrors(prev => ({ ...prev, protein: error || '' }));
  }, [onUpdateGoalInput]);

  const handleCarbsChange = useCallback((value: string) => {
    onUpdateGoalInput('carbs', value);
    const error = validateMacroInput(value, 'Carbs');
    setErrors(prev => ({ ...prev, carbs: error || '' }));
  }, [onUpdateGoalInput]);

  const handleFatChange = useCallback((value: string) => {
    onUpdateGoalInput('fat', value);
    const error = validateMacroInput(value, 'Fat');
    setErrors(prev => ({ ...prev, fat: error || '' }));
  }, [onUpdateGoalInput]);

  return (
    <Card style={styles.card}>
      <GoalInputField
        label="Calories"
        value={goalInput.calories}
        onChangeText={handleCalorieChange}
        placeholder="2000"
        unit="kcal"
        keyboardType="number-pad"
        error={errors.calories}
        editable={!disabled}
      />

      <View style={styles.divider} />

      <GoalInputField
        label="Protein"
        value={goalInput.protein}
        onChangeText={handleProteinChange}
        placeholder="150.0"
        unit="g"
        keyboardType="decimal-pad"
        error={errors.protein}
        editable={!disabled}
      />

      <View style={styles.divider} />

      <GoalInputField
        label="Carbs"
        value={goalInput.carbs}
        onChangeText={handleCarbsChange}
        placeholder="250.0"
        unit="g"
        keyboardType="decimal-pad"
        error={errors.carbs}
        editable={!disabled}
      />

      <View style={styles.divider} />

      <GoalInputField
        label="Fat"
        value={goalInput.fat}
        onChangeText={handleFatChange}
        placeholder="70.0"
        unit="g"
        keyboardType="decimal-pad"
        error={errors.fat}
        editable={!disabled}
      />
    </Card>
  );
});

EditGoalCard.displayName = 'EditGoalCard';

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.separator,
    marginVertical: Spacing.xs,
  },
});
