import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { UnitFormatter } from '../../hooks/formatters/useUnitFormatter';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface PortionSelectorProps {
  portionGrams: number;
  formatter: UnitFormatter<any>;
  onPortionChange: (grams: number) => void;
  minGrams?: number;
  maxGrams?: number;
  disabled?: boolean;
}

const QUICK_PORTIONS_GRAMS = [50, 100, 150, 200];

export const PortionSelector = memo<PortionSelectorProps>(({
  portionGrams,
  formatter,
  onPortionChange,
  minGrams = 10,
  maxGrams = 500,
  disabled = false,
}) => {
  // Convert grams to display value
  const displayValue = formatter.getValue(portionGrams);
  const unitLabel = formatter.getUnitLabel();

  const handleDisplayChange = (text: string) => {
    const value = parseFloat(text);
    if (!isNaN(value) && value > 0) {
      const grams = formatter.toBaseUnit(value);
      if (grams >= minGrams && grams <= maxGrams) {
        onPortionChange(grams);
      }
    }
  };

  const handleSliderChange = (value: number) => {
    const grams = formatter.toBaseUnit(value);
    onPortionChange(grams);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Portion Size</Text>

      {/* Large input display */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={displayValue.toFixed(1)}
          onChangeText={handleDisplayChange}
          keyboardType="decimal-pad"
          selectTextOnFocus
          editable={!disabled}
          accessibilityLabel="Portion amount"
          accessibilityValue={{ text: `${displayValue.toFixed(1)} ${unitLabel}` }}
        />
        <Text style={styles.unitLabel}>{unitLabel}</Text>
      </View>

      {/* Slider */}
      <Slider
        style={styles.slider}
        minimumValue={formatter.getValue(minGrams)}
        maximumValue={formatter.getValue(maxGrams)}
        step={formatter.getValue(10)}
        value={displayValue}
        onValueChange={handleSliderChange}
        minimumTrackTintColor={AppColors.primary}
        maximumTrackTintColor={AppColors.separator}
        thumbTintColor={AppColors.primary}
        disabled={disabled}
        accessibilityLabel="Portion slider"
      />

      {/* Range labels */}
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{formatter.format(minGrams)}</Text>
        <Text style={styles.sliderLabel}>{formatter.format(maxGrams)}</Text>
      </View>

      {/* Quick portion buttons */}
      <View style={styles.quickPortions}>
        {QUICK_PORTIONS_GRAMS.map((grams) => {
          const isSelected = Math.abs(portionGrams - grams) < 5;

          return (
            <TouchableOpacity
              key={grams}
              style={[
                styles.quickButton,
                isSelected && styles.quickButtonActive,
              ]}
              onPress={() => onPortionChange(grams)}
              disabled={disabled}
              accessibilityLabel={`Set portion to ${formatter.format(grams)}`}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.quickButtonText,
                  isSelected && styles.quickButtonTextActive,
                ]}
              >
                {formatter.format(grams)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

PortionSelector.displayName = 'PortionSelector';

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.label,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    color: AppColors.primary,
    textAlign: 'center',
    minWidth: 120,
  },
  unitLabel: {
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
  },
  sliderLabel: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
  },
  quickPortions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.primary,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  quickButtonActive: {
    backgroundColor: AppColors.primary,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  quickButtonTextActive: {
    color: '#FFF',
  },
});
