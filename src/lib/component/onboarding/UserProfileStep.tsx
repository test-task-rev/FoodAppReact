import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { useOnboarding } from '../../context/OnboardingContext';
import { Gender, UnitSystem, calculateAge, isValidAge } from '../../types/Onboarding';
import { useHeightFormatter } from '../../hooks/formatters/useHeightFormatter';
import { useWeightFormatter } from '../../hooks/formatters/useWeightFormatter';
import { GenderCard } from './GenderCard';
import { SliderInput } from './SliderInput';
import { ImperialHeightPicker } from './ImperialHeightPicker';
import { UnitPreferenceToggle } from '../core/UnitPreferenceToggle';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { convertKgToLbs, convertLbsToKg } from '../../types/WeightEntry';

export const UserProfileStep: React.FC = () => {
  const { state, dispatch } = useOnboarding();
  const { data } = state;

  const heightFormatter = useHeightFormatter(data.unitSystem);
  const weightFormatter = useWeightFormatter(
    data.unitSystem === UnitSystem.METRIC ? 'metric' : 'imperial'
  );

  const [showDatePicker, setShowDatePicker] = useState(false);

  const age = calculateAge(data.birthdate);
  const ageValid = isValidAge(data.birthdate);

  // Handle gender selection
  const handleGenderSelect = (gender: Gender) => {
    dispatch({ type: 'SET_GENDER', payload: gender });
  };

  // Handle height change (metric)
  const handleHeightChange = (heightCm: number) => {
    dispatch({ type: 'SET_HEIGHT', payload: heightCm });
  };

  // Handle height change (imperial)
  const handleFeetChange = (feet: number) => {
    const { inches } = heightFormatter.toFeetAndInches(data.heightCm);
    const newHeightCm = heightFormatter.fromFeetAndInches(feet, inches);
    dispatch({ type: 'SET_HEIGHT', payload: newHeightCm });
  };

  const handleInchesChange = (inches: number) => {
    const { feet } = heightFormatter.toFeetAndInches(data.heightCm);
    const newHeightCm = heightFormatter.fromFeetAndInches(feet, inches);
    dispatch({ type: 'SET_HEIGHT', payload: newHeightCm });
  };

  // Handle weight change
  const handleWeightChange = (value: number) => {
    const weightKg =
      data.unitSystem === UnitSystem.METRIC ? value : convertLbsToKg(value);
    dispatch({ type: 'SET_WEIGHT', payload: weightKg });
  };

  // Get current weight in display units
  const displayWeight =
    data.unitSystem === UnitSystem.METRIC
      ? data.weightKg
      : convertKgToLbs(data.weightKg);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>
          We'll use this information to personalize your experience
        </Text>
      </View>

      {/* Unit Preference Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="resize-outline" size={20} color={AppColors.label} style={styles.sectionIcon} />
          <Text style={styles.sectionLabel}>Unit System</Text>
        </View>

        <UnitPreferenceToggle
          value={data.unitSystem}
          onChange={(unitSystem) =>
            dispatch({ type: 'SET_UNIT_SYSTEM', payload: unitSystem })
          }
        />
      </View>

      {/* Birthdate Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="calendar-outline" size={20} color={AppColors.label} style={styles.sectionIcon} />
          <Text style={styles.sectionLabel}>Birthdate</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateButtonText}>
              {data.birthdate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <DatePicker
            modal
            mode="date"
            open={showDatePicker}
            date={data.birthdate}
            onConfirm={(date) => {
              dispatch({ type: 'SET_BIRTHDATE', payload: date });
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
            title="Select Your Birthdate"
            confirmText="Done"
            cancelText="Cancel"
            theme="light"
            maximumDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 13))
            }
          />

          {ageValid ? (
            <Text style={styles.ageText}>Age: {age} years old</Text>
          ) : (
            <Text style={styles.ageError}>
              You must be at least 13 years old
            </Text>
          )}
        </View>
      </View>

      {/* Gender Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="person-outline" size={20} color={AppColors.label} style={styles.sectionIcon} />
          <Text style={styles.sectionLabel}>Gender</Text>
        </View>

        <View style={styles.genderContainer}>
          <GenderCard
            gender={Gender.MALE}
            selected={data.gender === Gender.MALE}
            onPress={() => handleGenderSelect(Gender.MALE)}
          />
          <GenderCard
            gender={Gender.FEMALE}
            selected={data.gender === Gender.FEMALE}
            onPress={() => handleGenderSelect(Gender.FEMALE)}
          />
          <GenderCard
            gender={Gender.OTHER}
            selected={data.gender === Gender.OTHER}
            onPress={() => handleGenderSelect(Gender.OTHER)}
          />
        </View>
      </View>

      {/* Height Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="swap-vertical-outline" size={20} color={AppColors.label} style={styles.sectionIcon} />
          <Text style={styles.sectionLabel}>Height</Text>
        </View>

        {data.unitSystem === UnitSystem.METRIC ? (
          <SliderInput
            label="Height"
            value={data.heightCm}
            minValue={100}
            maxValue={220}
            step={1}
            unit="cm"
            onValueChange={handleHeightChange}
            color="#007AFF"
          />
        ) : (
          <ImperialHeightPicker
            feet={heightFormatter.toFeetAndInches(data.heightCm).feet}
            inches={heightFormatter.toFeetAndInches(data.heightCm).inches}
            onFeetChange={handleFeetChange}
            onInchesChange={handleInchesChange}
          />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="scale-outline" size={20} color={AppColors.label} style={styles.sectionIcon} />
          <Text style={styles.sectionLabel}>Weight</Text>
        </View>

        <SliderInput
          label="Weight"
          value={displayWeight}
          minValue={data.unitSystem === UnitSystem.METRIC ? 30 : 66}
          maxValue={data.unitSystem === UnitSystem.METRIC ? 400 : 881}
          step={data.unitSystem === UnitSystem.METRIC ? 0.5 : 1}
          unit={data.unitSystem === UnitSystem.METRIC ? 'kg' : 'lbs'}
          onValueChange={handleWeightChange}
          formatValue={(val) =>
            data.unitSystem === UnitSystem.METRIC
              ? `${val.toFixed(1)} kg`
              : `${Math.round(val)} lbs`
          }
          color="#34C759"
        />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionIcon: {
    marginRight: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  card: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    padding: Spacing.md,
  },
  dateButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: AppColors.primary,
    borderRadius: Spacing.cornerRadiusSmall,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ageText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  ageError: {
    fontSize: 14,
    color: AppColors.error,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bottomSpacer: {
    height: Spacing.xxxl,
  },
});
