import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusLarge,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Spacing.shadowOpacity,
    shadowRadius: Spacing.shadowRadius,
    elevation: 3,
    marginVertical: 4,
  },
});
