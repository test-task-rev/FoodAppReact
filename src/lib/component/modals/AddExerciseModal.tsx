import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ValidatedInput } from '../core/ValidatedInput';

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: {
    exerciseName: string;
    durationMinutes: number;
    caloriesBurned: number;
  }) => Promise<void>;
}

interface FormData {
  exerciseName: string;
  duration: string;
  calories: string;
}

interface FormErrors {
  exerciseName?: string;
  duration?: string;
  calories?: string;
}

interface TouchedFields {
  exerciseName: boolean;
  duration: boolean;
  calories: boolean;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<FormData>({
    exerciseName: '',
    duration: '',
    calories: '',
  });

  const [touched, setTouched] = useState<TouchedFields>({
    exerciseName: false,
    duration: false,
    calories: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFormData({ exerciseName: '', duration: '', calories: '' });
      setTouched({ exerciseName: false, duration: false, calories: false });
      setIsLoading(false);
    }
  }, [visible]);

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    const trimmedName = formData.exerciseName.trim();
    if (!trimmedName) {
      errors.exerciseName = 'Exercise name is required';
    }

    if (!formData.duration) {
      errors.duration = 'Duration is required';
    } else {
      const durationNum = parseInt(formData.duration, 10);
      if (isNaN(durationNum) || durationNum <= 0) {
        errors.duration = 'Duration must be a positive number';
      }
    }

    if (!formData.calories) {
      errors.calories = 'Calories are required';
    } else {
      const caloriesNum = parseInt(formData.calories, 10);
      if (isNaN(caloriesNum) || caloriesNum <= 0) {
        errors.calories = 'Calories must be a positive number';
      }
    }

    return errors;
  };

  const errors = validateForm();

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async () => {
    setTouched({ exerciseName: true, duration: true, calories: true });

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        exerciseName: formData.exerciseName.trim(),
        durationMinutes: parseInt(formData.duration, 10),
        caloriesBurned: parseInt(formData.calories, 10),
      });
      onClose();
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Exercise</Text>
              <TouchableOpacity
                onPress={handleClose}
                disabled={isLoading}
                style={styles.closeButton}
              >
                <Icon name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.iconContainer}>
                <Icon name="barbell" size={60} color="#007AFF" />
              </View>

              <View style={styles.formSection}>
                <ValidatedInput
                  label="Exercise Name"
                  placeholder="e.g., Running, Cycling, Swimming"
                  value={formData.exerciseName}
                  onChangeText={(text) =>
                    setFormData(prev => ({ ...prev, exerciseName: text }))
                  }
                  onBlur={() => handleBlur('exerciseName')}
                  error={errors.exerciseName}
                  touched={touched.exerciseName}
                  editable={!isLoading}
                />

                <ValidatedInput
                  label="Duration (minutes)"
                  placeholder="30"
                  value={formData.duration}
                  onChangeText={(text) =>
                    setFormData(prev => ({ ...prev, duration: text }))
                  }
                  onBlur={() => handleBlur('duration')}
                  error={errors.duration}
                  touched={touched.duration}
                  editable={!isLoading}
                  keyboardType="number-pad"
                />

                <ValidatedInput
                  label="Calories Burned"
                  placeholder="200"
                  value={formData.calories}
                  onChangeText={(text) =>
                    setFormData(prev => ({ ...prev, calories: text }))
                  }
                  onBlur={() => handleBlur('calories')}
                  error={errors.calories}
                  touched={touched.calories}
                  editable={!isLoading}
                  keyboardType="number-pad"
                />
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  isLoading && styles.saveButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFF" size="small" />
                    <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 4,
  },
  scrollView: {
    flexGrow: 1,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
