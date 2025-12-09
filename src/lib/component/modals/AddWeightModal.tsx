import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { useWeightFormatter } from '../../hooks/formatters/useWeightFormatter';
import { UnitSystem } from '../../hooks/formatters/useUnitFormatter';

interface AddWeightModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (weight: number, date: Date) => Promise<void>;
  unitSystem: UnitSystem;
}

export const AddWeightModal: React.FC<AddWeightModalProps> = ({
  visible,
  onClose,
  onSave,
  unitSystem,
}) => {
  const [weight, setWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const weightFormatter = useWeightFormatter(unitSystem);

  const handleSave = async () => {
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) return;

    const weightInKg = weightFormatter.toBaseUnit(weightValue);

    await onSave(weightInKg, selectedDate);

    setWeight('');
    setSelectedDate(new Date());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={AppColors.label} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Weight</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputCard}>
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Weight</Text>
              <View style={styles.weightInputContainer}>
                <TextInput
                  style={styles.weightInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor={AppColors.tertiaryLabel}
                />
                <Text style={styles.unitLabel}>{weightFormatter.getUnitLabel()}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {selectedDate.toLocaleDateString()}
                </Text>
                <Icon name="calendar-outline" size={20} color={AppColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !weight && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!weight}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <DatePicker
          modal
          mode="date"
          open={showDatePicker}
          date={selectedDate}
          onConfirm={(date) => {
            setSelectedDate(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
          title="Select Date"
          confirmText="Done"
          cancelText="Cancel"
          theme="light"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: AppColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.separator,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.label,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.md,
  },
  inputCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusLarge,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputSection: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.label,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  weightInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: AppColors.primary,
    textAlign: 'center',
    minWidth: 100,
  },
  unitLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: AppColors.secondaryLabel,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.separator,
    marginVertical: Spacing.lg,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dateText: {
    fontSize: 15,
    color: AppColors.label,
  },
  modalFooter: {
    padding: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
  },
  saveButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.cornerRadiusMedium,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: AppColors.secondaryLabel,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
