import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UnitSystem } from '../../types/Onboarding';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface UnitPreferenceToggleProps {
  value: UnitSystem;
  onChange: (unitSystem: UnitSystem) => void;
}

export const UnitPreferenceToggle: React.FC<UnitPreferenceToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          value === UnitSystem.METRIC && styles.buttonActive,
        ]}
        onPress={() => onChange(UnitSystem.METRIC)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            value === UnitSystem.METRIC && styles.buttonTextActive,
          ]}
        >
          Metric
        </Text>
        <Text
          style={[
            styles.buttonSubtext,
            value === UnitSystem.METRIC && styles.buttonSubtextActive,
          ]}
        >
          kg, cm
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          value === UnitSystem.IMPERIAL && styles.buttonActive,
        ]}
        onPress={() => onChange(UnitSystem.IMPERIAL)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            value === UnitSystem.IMPERIAL && styles.buttonTextActive,
          ]}
        >
          Imperial
        </Text>
        <Text
          style={[
            styles.buttonSubtext,
            value === UnitSystem.IMPERIAL && styles.buttonSubtextActive,
          ]}
        >
          lbs, ft/in
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    padding: 4,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Spacing.cornerRadiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: 2,
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonSubtext: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
  },
  buttonSubtextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
