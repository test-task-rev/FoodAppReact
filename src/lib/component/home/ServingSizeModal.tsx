import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { VolumeFormatter } from '../../hooks/formatters/useVolumeFormatter';

interface ServingSizeModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSize: number;
  onSelectSize: (size: number) => void;
  volumeFormatter: VolumeFormatter;
}

const SERVING_SIZES = [100, 150, 200, 250, 500, 750, 1000];

export const ServingSizeModal: React.FC<ServingSizeModalProps> = ({
  visible,
  onClose,
  selectedSize,
  onSelectSize,
  volumeFormatter,
}) => {
  const handleSelectSize = (size: number) => {
    onSelectSize(size);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Select Serving Size</Text>

          <View style={styles.optionsContainer}>
            {SERVING_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.option,
                  selectedSize === size && styles.optionSelected,
                ]}
                onPress={() => handleSelectSize(size)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedSize === size && styles.optionTextSelected,
                  ]}
                >
                  {volumeFormatter.format(size)}
                </Text>
                {selectedSize === size && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: Spacing.cornerRadiusLarge,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.cornerRadiusMedium,
    backgroundColor: AppColors.tertiaryBackground,
  },
  optionSelected: {
    backgroundColor: AppColors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.label,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmark: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.primary,
  },
});
