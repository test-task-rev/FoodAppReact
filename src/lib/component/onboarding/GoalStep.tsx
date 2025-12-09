import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useOnboarding } from '../../context/OnboardingContext';
import { GoalType, getGoalTypeLabel, UnitSystem } from '../../types/Onboarding';
import { SliderInput } from './SliderInput';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { convertKgToLbs, convertLbsToKg } from '../../types/WeightEntry';

// Constants
const WEIGHT_CHANGE_RATE_LIMITS = {
  METRIC: {
    MIN: 0.25,
    MAX: 1.0,
    STEP: 0.25,
    RECOMMENDED: 0.5,
  },
  IMPERIAL: {
    MIN: 0.5,
    MAX: 2.0,
    STEP: 0.5,
    RECOMMENDED: 1.0,
  },
} as const;

const GOAL_OPTIONS = [
  {
    type: GoalType.LOSE_WEIGHT,
    iconName: 'trending-down-outline',
    iconColor: '#FF9500',
    iconBg: '#FFF3E0',
  },
  {
    type: GoalType.MAINTAIN_WEIGHT,
    iconName: 'remove-outline',
    iconColor: '#34C759',
    iconBg: '#E8F5E9',
  },
  {
    type: GoalType.GAIN_WEIGHT,
    iconName: 'trending-up-outline',
    iconColor: '#007AFF',
    iconBg: '#E3F2FD',
  },
] as const;

interface WeightChangeRateConfig {
  displayValue: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  recommended: number;
  decimalPlaces: number;
}

const useWeightChangeRateConfig = (
  weightChangeRateKg: number,
  unitSystem: UnitSystem
): WeightChangeRateConfig => {
  return useMemo(() => {
    const isImperial = unitSystem === UnitSystem.IMPERIAL;
    const limits = isImperial
      ? WEIGHT_CHANGE_RATE_LIMITS.IMPERIAL
      : WEIGHT_CHANGE_RATE_LIMITS.METRIC;

    return {
      displayValue: isImperial
        ? convertKgToLbs(weightChangeRateKg)
        : weightChangeRateKg,
      unit: isImperial ? 'lbs/week' : 'kg/week',
      min: limits.MIN,
      max: limits.MAX,
      step: limits.STEP,
      recommended: limits.RECOMMENDED,
      decimalPlaces: isImperial ? 1 : 2,
    };
  }, [weightChangeRateKg, unitSystem]);
};

export const GoalStep: React.FC = () => {
  const { state, dispatch } = useOnboarding();
  const { goalType, weightChangeRateKg, unitSystem } = state.data;

  const rateConfig = useWeightChangeRateConfig(weightChangeRateKg, unitSystem);

  const handleGoalSelect = (type: GoalType) => {
    dispatch({ type: 'SET_GOAL_TYPE', payload: type });

    // Reset weight change rate if switching to maintain
    if (type === GoalType.MAINTAIN_WEIGHT) {
      dispatch({ type: 'SET_WEIGHT_CHANGE_RATE', payload: 0 });
    } else if (weightChangeRateKg === 0) {
      // Set default recommended rate if coming from maintain
      const defaultRate =
        unitSystem === UnitSystem.IMPERIAL
          ? convertLbsToKg(WEIGHT_CHANGE_RATE_LIMITS.IMPERIAL.RECOMMENDED)
          : WEIGHT_CHANGE_RATE_LIMITS.METRIC.RECOMMENDED;
      dispatch({ type: 'SET_WEIGHT_CHANGE_RATE', payload: defaultRate });
    }
  };

  const handleWeightChangeRateChange = (displayValue: number) => {
    const valueInKg =
      unitSystem === UnitSystem.IMPERIAL
        ? convertLbsToKg(displayValue)
        : displayValue;
    dispatch({ type: 'SET_WEIGHT_CHANGE_RATE', payload: valueInKg });
  };

  const formatRateValue = (value: number): string => {
    return `${value.toFixed(rateConfig.decimalPlaces)} ${rateConfig.unit}`;
  };

  const showWeightChangeRate = goalType !== GoalType.MAINTAIN_WEIGHT;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your goal</Text>
          <Text style={styles.subtitle}>
            What would you like to achieve?
          </Text>
        </View>

        {/* Goal Options */}
        <View style={styles.optionsContainer}>
          {GOAL_OPTIONS.map(({ type, iconName, iconColor, iconBg }) => {
            const isSelected = goalType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => handleGoalSelect(type)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  {/* Icon Container */}
                  <View
                    style={[styles.iconContainer, { backgroundColor: iconBg }]}
                  >
                    <Icon name={iconName} size={32} color={iconColor} />
                  </View>

                  {/* Text Content */}
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>
                      {getGoalTypeLabel(type)}
                    </Text>
                  </View>

                  {/* Checkmark */}
                  <View style={styles.checkmarkContainer}>
                    {isSelected && (
                      <Icon
                        name="checkmark-circle"
                        size={28}
                        color="#007AFF"
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Weight Change Rate Slider */}
        {showWeightChangeRate && (
          <View style={styles.sliderSection}>
            <View style={styles.sliderHeader}>
              <Icon
                name="speedometer-outline"
                size={20}
                color={AppColors.label}
              />
              <Text style={styles.sliderTitle}>
                {goalType === GoalType.LOSE_WEIGHT
                  ? 'Weight loss rate'
                  : 'Weight gain rate'}
              </Text>
            </View>
            <Text style={styles.sliderSubtitle}>
              Recommended: {rateConfig.recommended} {rateConfig.unit}
            </Text>

            <SliderInput
              label="Rate"
              value={rateConfig.displayValue}
              minValue={rateConfig.min}
              maxValue={rateConfig.max}
              step={rateConfig.step}
              unit={rateConfig.unit}
              onValueChange={handleWeightChangeRateChange}
              formatValue={formatRateValue}
              color="#007AFF"
            />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

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
  optionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 2,
    borderColor: AppColors.cardBorder,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderSection: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    padding: Spacing.lg,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  sliderSubtitle: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    marginBottom: Spacing.md,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
