import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface GoalInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  unit: string;
  keyboardType?: 'number-pad' | 'decimal-pad';
  error?: string;
  editable?: boolean;
}

export const GoalInputField = memo<GoalInputFieldProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  keyboardType = 'decimal-pad',
  error,
  editable = true,
}) => {
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              error && styles.inputError,
              !editable && styles.inputDisabled,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={AppColors.tertiaryLabel}
            keyboardType={keyboardType}
            editable={editable}
            selectTextOnFocus
          />
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

GoalInputField.displayName = 'GoalInputField';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.label,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontSize: 16,
    color: AppColors.label,
    textAlign: 'right',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 80,
  },
  inputError: {
    color: AppColors.error,
  },
  inputDisabled: {
    color: AppColors.tertiaryLabel,
  },
  unit: {
    fontSize: 16,
    color: AppColors.secondaryLabel,
    marginLeft: 4,
    minWidth: 40,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 4,
    marginLeft: Spacing.sm,
  },
});
