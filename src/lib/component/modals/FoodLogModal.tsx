import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { PortionSelector } from '../core/PortionSelector';
import { Card } from '../core/Card';
import { FormField } from '../core/FormField';
import { ValidatedInput } from '../core/ValidatedInput';
import { useQuickLog } from '../../hooks/useQuickLog';
import { usePortionFormatter } from '../../hooks/formatters/usePortionFormatter';
import { UnitSystem } from '../../hooks/formatters/useUnitFormatter';
import { foodNameRules } from '../../validators/foodNameRules';
import { caloriesRules, macroRules } from '../../validators/nutritionRules';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import type { MealType } from '../../types/MealType';
import type { FoodLog } from '../../types/FoodLog';

interface FoodLogModalProps {
  visible: boolean;
  onClose: () => void;
  mealType: MealType;
  date: Date;
  unitSystem: UnitSystem;
  onSuccess?: () => void;
  existingLog?: FoodLog;
}

interface FoodLogFormData {
  foodName: string;
  calories: string;
  protein: string;
  carbohydrates: string;
  fat: string;
}

export const FoodLogModal: React.FC<FoodLogModalProps> = ({
  visible,
  onClose,
  mealType,
  date,
  unitSystem,
  onSuccess,
  existingLog,
}) => {
  const isEditMode = !!existingLog;
  const [portionGrams, setPortionGrams] = useState(existingLog?.portion || 100);

  const { control, handleSubmit, reset } = useForm<FoodLogFormData>({
    defaultValues: existingLog ? {
      foodName: existingLog.foodName,
      calories: existingLog.calories.toString(),
      protein: existingLog.protein.toString(),
      carbohydrates: existingLog.carbohydrates.toString(),
      fat: existingLog.fat.toString(),
    } : {
      foodName: '',
      calories: '',
      protein: '',
      carbohydrates: '',
      fat: '',
    },
    mode: 'onTouched',
  });

  const portionFormatter = usePortionFormatter(unitSystem);

  const handleSuccess = useCallback(() => {
    // Reset form
    reset();
    setPortionGrams(100);
    onSuccess?.();
    onClose();
  }, [onSuccess, onClose, reset]);

  const handleError = useCallback((error: Error) => {
    Alert.alert('Error', `Failed to log food: ${error.message}`);
  }, []);

  const { submitQuickLog, isSubmitting } = useQuickLog({
    mealType,
    date,
    onSuccess: handleSuccess,
    onError: handleError,
    existingLog,
  });

  const onSubmit = useCallback((data: FoodLogFormData) => {
    submitQuickLog({
      foodName: data.foodName,
      portionGrams,
      calories: parseFloat(data.calories),
      protein: parseFloat(data.protein),
      carbohydrates: parseFloat(data.carbohydrates),
      fat: parseFloat(data.fat),
    });
  }, [portionGrams, submitQuickLog]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            disabled={isSubmitting}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isEditMode ? 'Edit Food Log' : 'Quick Log'}</Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            accessibilityLabel="Save food log"
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={AppColors.primary} />
            ) : (
              <Text style={styles.saveButton}>{isEditMode ? 'Update' : 'Save'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Food Name Input */}
          <Card style={styles.card}>
            <FormField control={control} name="foodName" rules={foodNameRules}>
              {({ value, onChange, onBlur, error, touched }) => (
                <ValidatedInput
                  label="Food Name"
                  placeholder="Enter food name..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error}
                  touched={touched}
                  editable={!isSubmitting}
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              )}
            </FormField>
          </Card>

          {/* Portion Selection */}
          <Card style={styles.card}>
            <PortionSelector
              portionGrams={portionGrams}
              formatter={portionFormatter}
              onPortionChange={setPortionGrams}
              disabled={isSubmitting}
            />
          </Card>

          {/* Nutrition Input */}
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Nutrition Information</Text>
            <View style={styles.nutritionInputs}>
              <FormField control={control} name="calories" rules={caloriesRules}>
                {({ value, onChange, onBlur, error, touched }) => (
                  <ValidatedInput
                    label="Calories"
                    placeholder="0"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={error}
                    touched={touched}
                    editable={!isSubmitting}
                    keyboardType="decimal-pad"
                  />
                )}
              </FormField>

              <View style={styles.macroRow}>
                <View style={styles.macroInput}>
                  <FormField control={control} name="protein" rules={macroRules}>
                    {({ value, onChange, onBlur, error, touched }) => (
                      <ValidatedInput
                        label="Protein (g)"
                        placeholder="0"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={error}
                        touched={touched}
                        editable={!isSubmitting}
                        keyboardType="decimal-pad"
                      />
                    )}
                  </FormField>
                </View>

                <View style={styles.macroInput}>
                  <FormField control={control} name="carbohydrates" rules={macroRules}>
                    {({ value, onChange, onBlur, error, touched }) => (
                      <ValidatedInput
                        label="Carbs (g)"
                        placeholder="0"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={error}
                        touched={touched}
                        editable={!isSubmitting}
                        keyboardType="decimal-pad"
                      />
                    )}
                  </FormField>
                </View>
              </View>

              <View style={styles.macroRow}>
                <View style={styles.macroInput}>
                  <FormField control={control} name="fat" rules={macroRules}>
                    {({ value, onChange, onBlur, error, touched }) => (
                      <ValidatedInput
                        label="Fat (g)"
                        placeholder="0"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={error}
                        touched={touched}
                        editable={!isSubmitting}
                        keyboardType="decimal-pad"
                      />
                    )}
                  </FormField>
                </View>

                <View style={styles.macroInput} />
              </View>
            </View>
          </Card>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Enter the nutrition information for this food. All fields are required.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: AppColors.separator,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  cancelButton: {
    fontSize: 16,
    color: AppColors.secondaryLabel,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.md,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: Spacing.md,
  },
  nutritionInputs: {
    gap: Spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  macroInput: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#FFF4E6',
    borderRadius: 10,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB347',
  },
  infoText: {
    fontSize: 14,
    color: '#8B5A00',
    lineHeight: 20,
  },
});
