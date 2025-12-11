import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface ProfileMenuItemProps {
  icon: string;
  title: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightContent?: React.ReactNode;
  destructive?: boolean;
  testID?: string;
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  title,
  onPress,
  showChevron = true,
  rightContent,
  destructive = false,
  testID,
}) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Icon
          name={icon}
          size={20}
          color={destructive ? AppColors.error : AppColors.label}
          style={styles.icon}
        />
        <Text style={[styles.title, destructive && styles.destructiveText]}>
          {title}
        </Text>
      </View>
      {rightContent || (
        showChevron && (
          <Icon
            name="chevron-forward"
            size={16}
            color={AppColors.tertiaryLabel}
          />
        )
      )}
    </View>
  );

  if (!onPress) {
    return <View testID={testID}>{content}</View>;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    minHeight: 44, // iOS recommended minimum touch target
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 24,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 16,
    color: AppColors.label,
    fontWeight: '400',
  },
  destructiveText: {
    color: AppColors.error,
  },
});
