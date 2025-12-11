import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface NutritionItemProps {
  label: string;
  value: string | number;
  unit: string;
  color: string;
  size?: 'small' | 'large';
}

/**
 * Reusable nutrition display component
 * Used in both FoodItemDetailScreen and QuickLogModal
 */
export const NutritionItem: React.FC<NutritionItemProps> = ({
  label,
  value,
  unit,
  color,
  size = 'large',
}) => {
  const isLarge = size === 'large';

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }, isLarge && styles.dotLarge]} />
      <Text style={[styles.label, isLarge && styles.labelLarge]}>{label}</Text>
      <Text style={[styles.value, isLarge && styles.valueLarge]}>
        {value}
        <Text style={[styles.unit, isLarge && styles.unitLarge]}> {unit}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: AppColors.label,
  },
  labelLarge: {
    fontSize: 15,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.label,
  },
  valueLarge: {
    fontSize: 18,
  },
  unit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: AppColors.secondaryLabel,
  },
  unitLarge: {
    fontSize: 13,
  },
});
