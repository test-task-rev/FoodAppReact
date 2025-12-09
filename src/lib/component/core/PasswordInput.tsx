import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ValidatedInput } from './ValidatedInput';

interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
  touched: boolean;
  editable?: boolean;
  autoComplete?: 'password' | 'password-new';
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  editable = true,
  autoComplete = 'password',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <ValidatedInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={error}
        touched={touched}
        editable={editable}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
      />
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setShowPassword(!showPassword)}
        disabled={!editable}
      >
        <Icon
          name={showPassword ? 'eye-off' : 'eye'}
          size={24}
          color="#666666"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  toggle: {
    position: 'absolute',
    right: 16,
    top: 44,
    padding: 8,
    zIndex: 10,
  },
});
