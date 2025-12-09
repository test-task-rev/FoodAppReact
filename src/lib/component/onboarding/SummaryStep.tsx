import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  calculateAge,
  getGenderLabel,
  getActivityLevelLabel,
  getGoalTypeLabel,
  UnitSystem,
  ActivityLevel,
  Gender,
  GoalType,
} from '../../types/Onboarding';
import { useHeightFormatter } from '../../hooks/formatters/useHeightFormatter';
import { useWeightFormatter } from '../../hooks/formatters/useWeightFormatter';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

const CALORIE_LIMITS = {
  MIN: 1000,
  MAX: 6500,
} as const;

const ACTIVITY_MULTIPLIERS = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
  [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
  [ActivityLevel.VERY_ACTIVE]: 1.725,
  [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
} as const;

const CALORIES_PER_KG = 7700;

const MACRO_PERCENTAGES = {
  PROTEIN: 0.30,
  CARBS: 0.45,
  FAT: 0.25,
} as const;

const CALORIES_PER_GRAM = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
} as const;

interface CalorieGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const clampCalories = (value: number): number => {
  return Math.max(CALORIE_LIMITS.MIN, Math.min(CALORIE_LIMITS.MAX, value));
};

const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number => {
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === Gender.MALE ? baseBMR + 5 : baseBMR - 161;
};

const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
};

const adjustForGoal = (
  tdee: number,
  goalType: GoalType,
  weightChangeRateKg: number
): number => {
  if (goalType === GoalType.MAINTAIN_WEIGHT) {
    return tdee;
  }

  const weeklyCalorieChange = weightChangeRateKg * CALORIES_PER_KG;
  const dailyCalorieChange = weeklyCalorieChange / 7;

  return goalType === GoalType.LOSE_WEIGHT
    ? tdee - dailyCalorieChange
    : tdee + dailyCalorieChange;
};

const calculateMacros = (calories: number): Omit<CalorieGoals, 'calories'> => {
  return {
    protein: (calories * MACRO_PERCENTAGES.PROTEIN) / CALORIES_PER_GRAM.PROTEIN,
    carbs: (calories * MACRO_PERCENTAGES.CARBS) / CALORIES_PER_GRAM.CARBS,
    fat: (calories * MACRO_PERCENTAGES.FAT) / CALORIES_PER_GRAM.FAT,
  };
};

export const SummaryStep: React.FC = () => {
  const { state, dispatch } = useOnboarding();
  const { data } = state;

  const heightFormatter = useHeightFormatter(data.unitSystem);
  const weightFormatter = useWeightFormatter(
    data.unitSystem === UnitSystem.METRIC ? 'metric' : 'imperial'
  );

  const age = calculateAge(data.birthdate);

  const calculatedGoals = useMemo((): CalorieGoals => {
    const bmr = calculateBMR(data.weightKg, data.heightCm, age, data.gender);
    const tdee = calculateTDEE(bmr, data.activityLevel);
    const adjustedCalories = adjustForGoal(
      tdee,
      data.goalType,
      data.weightChangeRateKg
    );

    const calories = clampCalories(Math.round(adjustedCalories));
    const macros = calculateMacros(calories);

    return {
      calories,
      ...macros,
    };
  }, [
    data.weightKg,
    data.heightCm,
    age,
    data.gender,
    data.activityLevel,
    data.goalType,
    data.weightChangeRateKg,
  ]);

  useEffect(() => {
    if (data.calorieGoal === 0 || !data.calorieGoal) {
      dispatch({ type: 'SET_CALORIE_GOAL', payload: calculatedGoals.calories });
      dispatch({
        type: 'SET_PROTEIN_GOAL',
        payload: Math.round(calculatedGoals.protein),
      });
      dispatch({
        type: 'SET_CARBS_GOAL',
        payload: Math.round(calculatedGoals.carbs),
      });
      dispatch({
        type: 'SET_FAT_GOAL',
        payload: Math.round(calculatedGoals.fat),
      });
    }
  }, [calculatedGoals, data.calorieGoal, dispatch]);

  const currentGoals: CalorieGoals = {
    calories: data.calorieGoal || calculatedGoals.calories,
    protein: data.proteinGoal || Math.round(calculatedGoals.protein),
    carbs: data.carbsGoal || Math.round(calculatedGoals.carbs),
    fat: data.fatGoal || Math.round(calculatedGoals.fat),
  };

  const handleAdjustCalories = (adjustment: number) => {
    const newCalories = clampCalories(currentGoals.calories + adjustment);

    if (newCalories === currentGoals.calories) {
      return;
    }

    const newMacros = calculateMacros(newCalories);
    dispatch({ type: 'SET_CALORIE_GOAL', payload: newCalories });
    dispatch({
      type: 'SET_PROTEIN_GOAL',
      payload: Math.round(newMacros.protein),
    });
    dispatch({ type: 'SET_CARBS_GOAL', payload: Math.round(newMacros.carbs) });
    dispatch({ type: 'SET_FAT_GOAL', payload: Math.round(newMacros.fat) });
  };

  const handleResetToRecommended = () => {
    dispatch({ type: 'SET_CALORIE_GOAL', payload: calculatedGoals.calories });
    dispatch({
      type: 'SET_PROTEIN_GOAL',
      payload: Math.round(calculatedGoals.protein),
    });
    dispatch({
      type: 'SET_CARBS_GOAL',
      payload: Math.round(calculatedGoals.carbs),
    });
    dispatch({ type: 'SET_FAT_GOAL', payload: Math.round(calculatedGoals.fat) });
  };

  const hasCustomizedGoals =
    currentGoals.calories !== calculatedGoals.calories;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Review your profile</Text>
          <Text style={styles.subtitle}>
            We've calculated your goals based on your information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>
          <View style={styles.infoCard}>
            <SummaryRow
              icon="person-outline"
              label="Age & Gender"
              value={`${age} years, ${getGenderLabel(data.gender)}`}
            />
            <SummaryRow
              icon="resize-outline"
              label="Height"
              value={heightFormatter.format(data.heightCm)}
            />
            <SummaryRow
              icon="scale-outline"
              label="Weight"
              value={weightFormatter.format(data.weightKg)}
            />
            <SummaryRow
              icon="fitness-outline"
              label="Activity"
              value={getActivityLevelLabel(data.activityLevel)}
            />
            <SummaryRow
              icon="flag-outline"
              label="Goal"
              value={getGoalTypeLabel(data.goalType)}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Targets</Text>

          <View style={styles.calorieCard}>
            <View style={styles.calorieHeader}>
              <View style={styles.calorieInfo}>
                <Text style={styles.calorieLabel}>Calories</Text>
                <Text style={styles.calorieValue}>
                  {currentGoals.calories}
                  <Text style={styles.calorieUnit}> kcal</Text>
                </Text>
              </View>
              <View style={styles.adjustmentButtons}>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => handleAdjustCalories(-100)}
                  activeOpacity={0.7}
                >
                  <Icon name="remove" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustButton}
                  onPress={() => handleAdjustCalories(100)}
                  activeOpacity={0.7}
                >
                  <Icon name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>

            {hasCustomizedGoals && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetToRecommended}
                activeOpacity={0.7}
              >
                <Icon
                  name="refresh-outline"
                  size={16}
                  color={AppColors.secondaryLabel}
                />
                <Text style={styles.resetText}>
                  Reset to recommended ({calculatedGoals.calories} kcal)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.macroGrid}>
            <MacroCard
              label="Protein"
              value={currentGoals.protein}
              color="#FF9500"
              icon="nutrition-outline"
            />
            <MacroCard
              label="Carbs"
              value={currentGoals.carbs}
              color="#34C759"
              icon="leaf-outline"
            />
            <MacroCard
              label="Fat"
              value={currentGoals.fat}
              color="#007AFF"
              icon="water-outline"
            />
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

interface SummaryRowProps {
  icon: string;
  label: string;
  value: string;
  isLast?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({
  icon,
  label,
  value,
  isLast = false,
}) => (
  <>
    <View style={styles.summaryRow}>
      <Icon name={icon} size={20} color={AppColors.secondaryLabel} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
    {!isLast && <View style={styles.divider} />}
  </>
);

interface MacroCardProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const MacroCard: React.FC<MacroCardProps> = ({ label, value, color, icon }) => (
  <View style={styles.macroCard}>
    <View style={[styles.macroIconContainer, { backgroundColor: `${color}15` }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>
      {Math.round(value)}
      <Text style={styles.macroUnit}>g</Text>
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
  },
  header: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.label,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.secondaryLabel,
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: Spacing.md,
  },
  infoCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    padding: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 15,
    color: AppColors.secondaryLabel,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.label,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.separator,
  },
  calorieCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieInfo: {
    flex: 1,
  },
  calorieLabel: {
    fontSize: 16,
    color: AppColors.secondaryLabel,
    marginBottom: 4,
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: AppColors.label,
  },
  calorieUnit: {
    fontSize: 20,
    fontWeight: '400',
    color: AppColors.secondaryLabel,
  },
  adjustmentButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: AppColors.separator,
  },
  resetText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  macroCard: {
    flex: 1,
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    padding: Spacing.md,
    alignItems: 'center',
  },
  macroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  macroLabel: {
    fontSize: 13,
    color: AppColors.secondaryLabel,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.label,
  },
  macroUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: AppColors.secondaryLabel,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
