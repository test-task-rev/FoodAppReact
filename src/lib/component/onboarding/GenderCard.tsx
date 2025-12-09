import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Gender, getGenderLabel } from '../../types/Onboarding';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface GenderCardProps {
  gender: Gender;
  selected: boolean;
  onPress: () => void;
}

export const GenderCard: React.FC<GenderCardProps> = ({
  gender,
  selected,
  onPress,
}) => {
  const getIconName = (): string => {
    switch (gender) {
      case Gender.MALE:
        return 'male';
      case Gender.FEMALE:
        return 'female';
      case Gender.OTHER:
        return 'male-female';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.containerSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon
        name={getIconName()}
        size={32}
        color={selected ? '#FFFFFF' : AppColors.primary}
        style={styles.icon}
      />
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {getGenderLabel(gender)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusMedium,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  containerSelected: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  icon: {
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.label,
  },
  labelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
