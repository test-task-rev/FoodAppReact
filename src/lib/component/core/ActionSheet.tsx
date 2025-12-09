import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

export interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  options,
  cancelLabel = 'Cancel',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          {options.map((option, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View style={styles.modalDivider} />}
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    option.destructive && styles.destructiveText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}

          <View style={styles.modalDivider} />

          <TouchableOpacity
            style={[styles.modalOption, styles.modalCancelOption]}
            onPress={onClose}
          >
            <Text style={styles.modalCancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  modalContent: {
    backgroundColor: AppColors.cardBackground,
    marginHorizontal: Spacing.lg,
    borderRadius: Spacing.cornerRadiusMedium,
    overflow: 'hidden',
  },
  modalOption: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 17,
    color: AppColors.primary,
    fontWeight: '400',
  },
  destructiveText: {
    color: AppColors.error,
  },
  modalCancelOption: {
    marginTop: Spacing.xs,
  },
  modalCancelText: {
    fontSize: 17,
    color: AppColors.error,
    fontWeight: '600',
  },
  modalDivider: {
    height: 0.5,
    backgroundColor: AppColors.separator,
  },
});
