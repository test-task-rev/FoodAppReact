import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ValidatedInput } from '../core/ValidatedInput';
import { PasswordInput } from '../core/PasswordInput';
import { FormField } from '../core/FormField';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../hooks/AuthProvider';
import { nameRules } from '../../validators/nameRules';
import { emailRules } from '../../validators/emailRules';
import {
  strongPasswordRules,
  confirmPasswordRules,
  getPasswordStrength,
} from '../../validators/passwordRules';
import { AuthStackParamList } from '../../../App';

interface AccountFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AccountStepProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
}

export const AccountStep: React.FC<AccountStepProps> = ({ navigation }) => {
  const { state, dispatch } = useOnboarding();
  const { signUp, isLoading, error, clearError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm<AccountFormData>({
    defaultValues: {
      displayName: state.data.displayName || '',
      email: state.data.email || '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const password = watch('password');
  const passwordStrength = getPasswordStrength(password || '');

  const onSubmit = async (data: AccountFormData) => {
    try {
      setLocalLoading(true);

      // Update onboarding context with account data
      dispatch({ type: 'SET_DISPLAY_NAME', payload: data.displayName.trim() });
      dispatch({ type: 'SET_EMAIL', payload: data.email.trim() });

      // Sign up the user with onboarding data
      await signUp(
        data.displayName.trim(),
        data.email.trim(),
        data.password,
        state.data
      );

      // Mark onboarding as complete
      dispatch({ type: 'COMPLETE_ONBOARDING' });

      // User will be automatically navigated to app by AuthNavigator
    } catch (err) {
      setLocalLoading(false);
      Alert.alert(
        'Sign Up Failed',
        error || 'An error occurred. Please try again.',
        [{ text: 'OK', onPress: () => clearError() }]
      );
    }
  };

  const loading = isLoading || localLoading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Almost done! Just a few more details to get started
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <FormField control={control} name="displayName" rules={nameRules}>
            {({ value, onChange, onBlur, error, touched }) => (
              <ValidatedInput
                label="Display Name"
                placeholder="Enter your name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error}
                touched={touched}
                editable={!loading}
                autoCapitalize="words"
                autoComplete="name"
              />
            )}
          </FormField>

          <FormField control={control} name="email" rules={emailRules}>
            {({ value, onChange, onBlur, error, touched }) => (
              <ValidatedInput
                label="Email"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error}
                touched={touched}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            )}
          </FormField>

          <FormField control={control} name="password" rules={strongPasswordRules}>
            {({ value, onChange, onBlur, error, touched }) => (
              <PasswordInput
                label="Password"
                placeholder="Create a password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error}
                touched={touched}
                editable={!loading}
                autoComplete="password-new"
              />
            )}
          </FormField>

          {/* Password Strength Indicator */}
          {password && password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${passwordStrength.percentage}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.strengthText,
                  { color: passwordStrength.color },
                ]}
              >
                {passwordStrength.text}
              </Text>
            </View>
          )}

          <FormField
            control={control}
            name="confirmPassword"
            rules={confirmPasswordRules(password || '')}
          >
            {({ value, onChange, onBlur, error, touched }) => (
              <PasswordInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error}
                touched={touched}
                editable={!loading}
                autoComplete="password-new"
              />
            )}
          </FormField>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={[styles.submitButtonText, { marginLeft: 12 }]}>
                  Creating Account...
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 8,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 24,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -12,
    marginBottom: 20,
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 60,
  },
  buttonSection: {
    marginTop: 'auto',
  },
  submitButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
