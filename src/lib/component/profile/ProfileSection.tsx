import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../core/Card';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface ProfileSectionProps {
  children: React.ReactNode;
  style?: object;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  children,
  style,
}) => {
  const childArray = React.Children.toArray(children);

  return (
    <Card style={[styles.section, style]}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childArray.length - 1 && (
            <View style={styles.divider} />
          )}
        </React.Fragment>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.separator,
    marginLeft: 40, // Align with text after icon
  },
});
