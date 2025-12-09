import React from 'react';
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
  ActivityLevel,
  getActivityLevelLabel,
  getActivityLevelDescription,
} from '../../types/Onboarding';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

const ACTIVITY_OPTIONS = [
  {
    level: ActivityLevel.SEDENTARY,
    iconName: 'bed-outline',
    iconColor: '#FF9500',
    iconBg: '#FFF3E0',
  },
  {
    level: ActivityLevel.LIGHTLY_ACTIVE,
    iconName: 'walk-outline',
    iconColor: '#34C759',
    iconBg: '#E8F5E9',
  },
  {
    level: ActivityLevel.MODERATELY_ACTIVE,
    iconName: 'bicycle-outline',
    iconColor: '#007AFF',
    iconBg: '#E3F2FD',
  },
  {
    level: ActivityLevel.VERY_ACTIVE,
    iconName: 'barbell-outline',
    iconColor: '#5856D6',
    iconBg: '#EDE7F6',
  },
  {
    level: ActivityLevel.EXTREMELY_ACTIVE,
    iconName: 'flame-outline',
    iconColor: '#FF3B30',
    iconBg: '#FFEBEE',
  },
];

export const ActivityLevelStep: React.FC = () => {
  const { state, dispatch } = useOnboarding();

  const handleActivitySelect = (level: ActivityLevel) => {
    dispatch({ type: 'SET_ACTIVITY_LEVEL', payload: level });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Activity level</Text>
          <Text style={styles.subtitle}>
            How active are you on a typical day?
          </Text>
        </View>

        {/* Activity Options */}
        <View style={styles.optionsContainer}>
          {ACTIVITY_OPTIONS.map(({ level, iconName, iconColor, iconBg }) => {
            const isSelected = state.data.activityLevel === level;

            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => handleActivitySelect(level)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  {/* Icon Container */}
                  <View
                    style={[styles.iconContainer, { backgroundColor: iconBg }]}
                  >
                    <Icon name={iconName} size={28} color={iconColor} />
                  </View>

                  {/* Text Content */}
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>
                      {getActivityLevelLabel(level)}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {getActivityLevelDescription(level)}
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    lineHeight: 18,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});
