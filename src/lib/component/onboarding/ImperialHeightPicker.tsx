import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SliderInput } from './SliderInput';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface ImperialHeightPickerProps {
  feet: number;
  inches: number;
  onFeetChange: (feet: number) => void;
  onInchesChange: (inches: number) => void;
}

export const ImperialHeightPicker: React.FC<ImperialHeightPickerProps> = ({
  feet,
  inches,
  onFeetChange,
  onInchesChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {feet}' {inches}"
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <SliderInput
          label="Feet"
          value={feet}
          minValue={3}
          maxValue={8}
          step={1}
          unit="ft"
          onValueChange={onFeetChange}
          formatValue={(val) => `${val} ft`}
          color="#007AFF"
        />
      </View>

      <View style={styles.sliderContainer}>
        <SliderInput
          label="Inches"
          value={inches}
          minValue={0}
          maxValue={11}
          step={1}
          unit="in"
          onValueChange={onInchesChange}
          formatValue={(val) => `${val} in`}
          color="#007AFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    padding: Spacing.md,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.separator,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  sliderContainer: {
    marginBottom: Spacing.sm,
  },
});
