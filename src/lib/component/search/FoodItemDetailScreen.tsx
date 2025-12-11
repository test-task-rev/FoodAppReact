import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { FoodItem } from '../../types/FoodItem';
import { MealType } from '../../types/MealType';
import { UnitSystem } from '../../hooks/formatters/useUnitFormatter';
import { usePortionFormatter } from '../../hooks/formatters/usePortionFormatter';
import { useFoodLog } from '../../hooks/useFoodLog';
import { FoodFeedback } from './FoodFeedback';
import { Card } from '../core/Card';
import { NutritionItem } from '../core/NutritionItem';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

type FoodItemDetailRouteProp = RouteProp<{
  FoodItemDetail: {
    foodItem: FoodItem;
    mealType: MealType;
    entryDate: Date;
    unitSystem: UnitSystem;
    onSuccess?: () => void;
  };
}, 'FoodItemDetail'>;

export const FoodItemDetailScreen: React.FC = () => {
  const route = useRoute<FoodItemDetailRouteProp>();
  const { foodItem, mealType, entryDate, unitSystem, onSuccess } = route.params;
  const navigation = useNavigation();
  const { addFoodLog } = useFoodLog();
  const portionFormatter = usePortionFormatter(unitSystem);

  // Backend always stores in grams, convert to display unit
  const initialDisplayValue = portionFormatter.getValue(foodItem.portion);
  const [displayPortion, setDisplayPortion] = useState(initialDisplayValue);
  const [isSaving, setIsSaving] = useState(false);

  // Always work in grams internally (base unit)
  const portionGrams = portionFormatter.toBaseUnit(displayPortion);

  // Calculate nutrition based on portion in grams
  const calculateNutrition = (nutrientPer100g: number) => {
    return (nutrientPer100g * portionGrams) / 100;
  };

  const totalCalories = calculateNutrition(foodItem.calories);
  const totalProtein = calculateNutrition(foodItem.protein);
  const totalCarbs = calculateNutrition(foodItem.carbohydrates);
  const totalFat = calculateNutrition(foodItem.fat);

  // Quick portion buttons (base values in grams, display in user's unit)
  const quickPortionsGrams = [50, 100, 150, 200];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addFoodLog({
        foodName: foodItem.foodName,
        portion: portionGrams, // Always save in grams
        unit: 'grams',
        calories: totalCalories,
        protein: totalProtein,
        carbohydrates: totalCarbs,
        fat: totalFat,
        consumedAt: entryDate,
        mealType: mealType,
      });

      navigation.goBack();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save food log:', error);
      setIsSaving(false);
    }
  };

  const unitLabel = portionFormatter.getUnitLabel();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Food Name Header */}
        <View style={styles.header}>
          <Text style={styles.foodName}>{foodItem.foodName}</Text>
          <Text style={styles.perServing}>Per 100{unitLabel}</Text>
        </View>

        {/* Portion Selection */}
        <Card style={styles.portionCard}>
          <Text style={styles.sectionTitle}>How much?</Text>

          {/* Portion Input - Display in user's preferred unit */}
          <View style={styles.portionInputContainer}>
            <TextInput
              style={styles.portionInput}
              value={displayPortion.toFixed(1)}
              onChangeText={(text) => {
                const value = parseFloat(text);
                if (!isNaN(value) && value > 0) {
                  setDisplayPortion(value);
                }
              }}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
            <Text style={styles.portionUnit}>{unitLabel}</Text>
          </View>

          {/* Slider - Range in user's unit */}
          <Slider
            style={styles.slider}
            minimumValue={portionFormatter.getValue(10)} // 10g or ~0.35oz
            maximumValue={portionFormatter.getValue(500)} // 500g or ~17.6oz
            step={portionFormatter.getValue(10)} // 10g or ~0.35oz increments
            value={displayPortion}
            onValueChange={setDisplayPortion}
            minimumTrackTintColor={AppColors.primary}
            maximumTrackTintColor={AppColors.separator}
            thumbTintColor={AppColors.primary}
          />

          {/* Range Labels */}
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>
              {portionFormatter.format(10)}
            </Text>
            <Text style={styles.sliderLabel}>
              {portionFormatter.format(500)}
            </Text>
          </View>

          {/* Quick Portion Buttons */}
          <View style={styles.quickPortions}>
            {quickPortionsGrams.map((grams) => {
              const displayValue = portionFormatter.getValue(grams);
              const isSelected = Math.abs(displayPortion - displayValue) < 1;

              return (
                <TouchableOpacity
                  key={grams}
                  style={[
                    styles.quickPortionButton,
                    isSelected && styles.quickPortionButtonActive,
                  ]}
                  onPress={() => setDisplayPortion(displayValue)}
                >
                  <Text
                    style={[
                      styles.quickPortionText,
                      isSelected && styles.quickPortionTextActive,
                    ]}
                  >
                    {portionFormatter.format(grams)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Total Nutrition - Macros ALWAYS in grams */}
        <Card style={styles.totalCard}>
          <Text style={styles.sectionTitle}>Total Nutrition</Text>
          <View style={styles.totalNutrition}>
            <NutritionItem
              label="Calories"
              value={Math.round(totalCalories)}
              unit="cal"
              color={AppColors.warning}
              size="large"
            />
            <NutritionItem
              label="Protein"
              value={totalProtein.toFixed(1)}
              unit="g"
              color={AppColors.info}
              size="large"
            />
            <NutritionItem
              label="Carbs"
              value={totalCarbs.toFixed(1)}
              unit="g"
              color={AppColors.accent}
              size="large"
            />
            <NutritionItem
              label="Fat"
              value={totalFat.toFixed(1)}
              unit="g"
              color={AppColors.secondary}
              size="large"
            />
          </View>
        </Card>

        {/* Feedback Component */}
        <FoodFeedback foodId={foodItem.foodId} foodName={foodItem.foodName} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Save Button (Fixed at bottom) */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Add to {mealType}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.label,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  perServing: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
  },
  nutritionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  nutritionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nutritionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nutritionLabel: {
    fontSize: 15,
    color: AppColors.label,
  },
  nutritionRowRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
  },
  nutritionUnit: {
    fontSize: 13,
    color: AppColors.secondaryLabel,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.separator,
  },
  portionCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: Spacing.md,
  },
  portionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  portionInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: AppColors.primary,
    textAlign: 'center',
    minWidth: 120,
  },
  portionUnit: {
    fontSize: 20,
    color: AppColors.secondaryLabel,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sliderLabel: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
  },
  quickPortions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickPortionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.primary,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  quickPortionButtonActive: {
    backgroundColor: AppColors.primary,
  },
  quickPortionText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  quickPortionTextActive: {
    color: '#FFF',
  },
  totalCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  totalNutrition: {
    gap: Spacing.md,
  },
  saveButtonContainer: {
    padding: Spacing.md,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: AppColors.separator,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: AppColors.tertiaryLabel,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
