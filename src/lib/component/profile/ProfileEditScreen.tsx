import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// Switched back to the community picker
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { Card } from '../core/Card';
import { FormField } from '../core/FormField';
import { ValidatedInput } from '../core/ValidatedInput';
import { UnitPreferenceToggle } from '../core/UnitPreferenceToggle';
import { SliderInput } from '../onboarding/SliderInput';
import { ImperialHeightPicker } from '../onboarding/ImperialHeightPicker';
import { useProfile } from '../../hooks/ProfileProvider';
import { parseGender, parseActivityLevel, parseUnitSystem } from '../../hooks/useProfileState';
import { useHeightFormatter } from '../../hooks/formatters/useHeightFormatter';
import { nameRules } from '../../validators/nameRules';
import {
  Gender,
  ActivityLevel,
  UnitSystem,
  getGenderLabel,
  getActivityLevelLabel,
  getActivityLevelDescription,
  calculateAge,
  isValidAge,
} from '../../types/Onboarding';
import { convertKgToLbs, convertLbsToKg } from '../../types/WeightEntry';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface ProfileFormState {
  displayName: string;
  birthdate: Date;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
}

const ACTIVITY_OPTIONS = [
  { level: ActivityLevel.SEDENTARY, icon: 'bed-outline' },
  { level: ActivityLevel.LIGHTLY_ACTIVE, icon: 'walk-outline' },
  { level: ActivityLevel.MODERATELY_ACTIVE, icon: 'bicycle-outline' },
  { level: ActivityLevel.VERY_ACTIVE, icon: 'barbell-outline' },
  { level: ActivityLevel.EXTREMELY_ACTIVE, icon: 'flame-outline' },
];

export const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const { profile, isLoadingProfile: isLoading, refreshProfile, updateProfile } = useProfile();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // State to control the visibility of the DatePicker modal/dialog
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  
  const [formState, setFormState] = useState<ProfileFormState>({
    displayName: '',
    birthdate: new Date(),
    gender: Gender.MALE,
    heightCm: 170,
    weightKg: 70,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    unitSystem: UnitSystem.METRIC,
  });

  const [originalState, setOriginalState] = useState<ProfileFormState | null>(null);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: { displayName: '' },
    mode: 'onTouched',
  });

  const heightFormatter = useHeightFormatter(formState.unitSystem);

  // Load profile on mount
  useEffect(() => {
    if (profile && !isInitialLoading) {
      // Profile already loaded by context
      const birthdate = new Date(profile.birthdate);

      const initialState: ProfileFormState = {
        displayName: profile.displayName,
        birthdate: birthdate,
        gender: parseGender(profile.gender as unknown as string),
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        activityLevel: parseActivityLevel(profile.activityLevel as unknown as string),
        unitSystem: parseUnitSystem(profile.unitSystem as unknown as string),
      };

      setFormState(initialState);
      setOriginalState({
        ...initialState,
        birthdate: new Date(birthdate.getTime())
      });
      reset({ displayName: initialState.displayName });
      setIsInitialLoading(false);
    } else if (isInitialLoading) {
      loadProfileData();
    }
  }, [profile]);

  const loadProfileData = async () => {
    setIsInitialLoading(true);
    try {
      await refreshProfile();
      if (profile) {
        const profileData = profile;
        const birthdate = new Date(profileData.birthdate);

        const initialState: ProfileFormState = {
          displayName: profileData.displayName,
          birthdate: birthdate,
          gender: parseGender(profileData.gender as unknown as string),
          heightCm: profileData.heightCm,
          weightKg: profileData.weightKg,
          activityLevel: parseActivityLevel(profileData.activityLevel as unknown as string),
          unitSystem: parseUnitSystem(profileData.unitSystem as unknown as string),
        };

        setFormState(initialState);
        setOriginalState({
          ...initialState,
          birthdate: new Date(birthdate.getTime())
        });
        reset({ displayName: initialState.displayName });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Update form field
  const updateField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Handle height change (imperial)
  const handleFeetChange = (feet: number) => {
    const { inches } = heightFormatter.toFeetAndInches(formState.heightCm);
    const newHeightCm = heightFormatter.fromFeetAndInches(feet, inches);
    updateField('heightCm', newHeightCm);
  };

  const handleInchesChange = (inches: number) => {
    const { feet } = heightFormatter.toFeetAndInches(formState.heightCm);
    const newHeightCm = heightFormatter.fromFeetAndInches(feet, inches);
    updateField('heightCm', newHeightCm);
  };

  const handleWeightChange = (value: number) => {
    const weightInKg = formState.unitSystem === UnitSystem.METRIC ? value : convertLbsToKg(value);
    updateField('weightKg', weightInKg);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePickerModal(false);

    if (selectedDate) {
      updateField('birthdate', selectedDate);
    }
  };

  // Handle save
  const onSubmit = async (data: { displayName: string }) => {
    if (!isValidAge(formState.birthdate)) {
      Alert.alert('Invalid Age', 'You must be at least 13 years old.');
      return;
    }

    try {
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      await updateProfile({
        displayName: data.displayName.trim(),
        birthdate: formatDate(formState.birthdate),
        gender: formState.gender.toString(),
        heightCm: formState.heightCm,
        weightKg: formState.weightKg,
        activityLevel: formState.activityLevel.toString(),
        unitSystem: formState.unitSystem.toString(),
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  // Check if form has changes
  const hasChanges = originalState && (
    formState.displayName !== originalState.displayName ||
    formState.gender !== originalState.gender ||
    formState.activityLevel !== originalState.activityLevel ||
    formState.unitSystem !== originalState.unitSystem ||
    Math.abs(formState.heightCm - originalState.heightCm) > 0.1 ||
    Math.abs(formState.weightKg - originalState.weightKg) > 0.1 ||
    formState.birthdate.toDateString() !== originalState.birthdate.toDateString()
  );

  const displayWeight = formState.unitSystem === UnitSystem.METRIC
    ? formState.weightKg
    : convertKgToLbs(formState.weightKg);

  const age = calculateAge(formState.birthdate);
  const ageValid = isValidAge(formState.birthdate);

  // Loading state
  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person-outline" size={20} color={AppColors.label} />
            <Text style={styles.cardHeaderText}>Basic Information</Text>
          </View>

          <FormField control={control} name="displayName" rules={nameRules}>
            {({ value, onChange, onBlur, error, touched }) => (
              <ValidatedInput
                label="Display Name"
                placeholder="Enter your name"
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  updateField('displayName', text);
                }}
                onBlur={onBlur}
                error={error}
                touched={touched}
                editable={!isLoading}
                autoCapitalize="words"
                autoComplete="name"
              />
            )}
          </FormField>

          <View style={styles.divider} />

          {/* Birthdate Section with Modal Trigger */}
          <View style={styles.dateSection}>
            <Text style={styles.label}>Birthdate</Text>
            
            <TouchableOpacity 
              style={styles.dateDisplayButton}
              onPress={() => setShowDatePickerModal(true)}
              disabled={isLoading}
            >
              <Text style={styles.dateDisplayText}>
                {formState.birthdate.toLocaleDateString()}
              </Text>
              <Icon name="calendar-outline" size={20} color={AppColors.primary} />
            </TouchableOpacity>
            
            {/* Conditional DatePicker */}
            {showDatePickerModal && (
              <DateTimePicker
                testID="dateTimePicker"
                value={formState.birthdate}
                mode="date"
                display={'spinner'} 
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 13))}
                onChange={handleDateChange}
              />
            )}

            {ageValid ? (
              <Text style={styles.ageText}>Age: {age} years old</Text>
            ) : (
              <Text style={styles.ageError}>You must be at least 13 years old</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.formRow}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {[Gender.MALE, Gender.FEMALE, Gender.OTHER].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderButton, formState.gender === g && styles.genderButtonActive]}
                  onPress={() => updateField('gender', g)}
                >
                  <Text style={[styles.genderButtonText, formState.gender === g && styles.genderButtonTextActive]}>
                    {getGenderLabel(g)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Unit System Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="resize-outline" size={20} color={AppColors.label} />
            <Text style={styles.cardHeaderText}>Unit System</Text>
          </View>

          <UnitPreferenceToggle
            value={formState.unitSystem}
            onChange={(unit) => updateField('unitSystem', unit)}
          />
          <Text style={styles.hint}>Used for height, weight, and food portions</Text>
        </Card>

        {/* Measurements Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="fitness-outline" size={20} color={AppColors.label} />
            <Text style={styles.cardHeaderText}>Measurements</Text>
          </View>

          {formState.unitSystem === UnitSystem.METRIC ? (
            <SliderInput
              label="Height"
              value={formState.heightCm}
              minValue={100}
              maxValue={220}
              step={1}
              unit="cm"
              onValueChange={(val) => updateField('heightCm', val)}
              color={AppColors.primary}
            />
          ) : (
            <View>
              <Text style={styles.label}>Height</Text>
              <ImperialHeightPicker
                feet={heightFormatter.toFeetAndInches(formState.heightCm).feet}
                inches={heightFormatter.toFeetAndInches(formState.heightCm).inches}
                onFeetChange={handleFeetChange}
                onInchesChange={handleInchesChange}
              />
            </View>
          )}

          <View style={styles.divider} />

          <SliderInput
            label="Weight"
            value={displayWeight}
            minValue={formState.unitSystem === UnitSystem.METRIC ? 30 : 66}
            maxValue={formState.unitSystem === UnitSystem.METRIC ? 400 : 881}
            step={formState.unitSystem === UnitSystem.METRIC ? 0.5 : 1}
            unit={formState.unitSystem === UnitSystem.METRIC ? 'kg' : 'lbs'}
            onValueChange={handleWeightChange}
            formatValue={(val) =>
              formState.unitSystem === UnitSystem.METRIC ? `${val.toFixed(1)} kg` : `${Math.round(val)} lbs`
            }
            color={AppColors.primary}
          />
        </Card>

        {/* Activity Level Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="barbell-outline" size={20} color={AppColors.label} />
            <Text style={styles.cardHeaderText}>Activity Level</Text>
          </View>

          {ACTIVITY_OPTIONS.map(({ level, icon }, index) => {
            const isSelected = formState.activityLevel === level;
            return (
              <View key={level}>
                <TouchableOpacity
                  style={[styles.activityOption, isSelected && styles.activityOptionSelected]}
                  onPress={() => updateField('activityLevel', level)}
                >
                  <Icon name={icon} size={24} color={isSelected ? AppColors.primary : AppColors.label} />
                  <View style={styles.activityTextContainer}>
                    <Text style={[styles.activityTitle, isSelected && styles.activityTitleSelected]}>
                      {getActivityLevelLabel(level)}
                    </Text>
                    <Text style={styles.activityDescription}>{getActivityLevelDescription(level)}</Text>
                  </View>
                  {isSelected && <Icon name="checkmark-circle" size={24} color={AppColors.primary} />}
                </TouchableOpacity>
                {index < ACTIVITY_OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </Card>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (!hasChanges || isLoading) && styles.saveButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: AppColors.secondaryLabel,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
    marginLeft: Spacing.xs,
  },
  formRow: {
    marginVertical: Spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.label,
    marginBottom: Spacing.xs,
  },
  dateSection: {
    marginVertical: Spacing.xs,
  },
  dateDisplayButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.cornerRadiusSmall,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    backgroundColor: '#FFFFFF', 
  },
  dateDisplayText: {
    fontSize: 16,
    color: AppColors.label,
    fontWeight: '500',
  },
  ageText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  ageError: {
    fontSize: 14,
    color: AppColors.error,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.cardBorder,
    marginVertical: Spacing.sm,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.cornerRadiusSmall,
    borderWidth: 1,
    borderColor: AppColors.cardBorder,
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
  },
  genderButtonActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.label,
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  activityOptionSelected: {
    backgroundColor: AppColors.background,
    borderRadius: Spacing.cornerRadiusSmall,
    paddingHorizontal: Spacing.xs,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.label,
    marginBottom: 2,
  },
  activityTitleSelected: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 13,
    color: AppColors.secondaryLabel,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.background,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: AppColors.cardBorder,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.cornerRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: AppColors.secondaryLabel,
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});