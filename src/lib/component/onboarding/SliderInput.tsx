import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface SliderInputProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  step?: number;
  unit: string;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  color?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  minValue,
  maxValue,
  step = 1,
  unit,
  onValueChange,
  formatValue,
  color = AppColors.primary,
}) => {
  const displayValue = formatValue
    ? formatValue(value)
    : `${Math.round(value)} ${unit}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color }]}>{displayValue}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={AppColors.separator}
        thumbTintColor={color}
      />

      <View style={styles.rangeContainer}>
        <Text style={styles.rangeText}>
          {Math.round(minValue)} {unit}
        </Text>
        <Text style={styles.rangeText}>
          {Math.round(maxValue)} {unit}
        </Text>
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
  header: {
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
  },
  valueContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  value: {
    fontSize: 32,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xxs,
  },
  rangeText: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
  },
});
