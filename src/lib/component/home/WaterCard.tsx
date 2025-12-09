import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { useVolumeFormatter, VolumeUnit } from '../../hooks/formatters/useVolumeFormatter';
import { ServingSizeModal } from './ServingSizeModal';
import { Card } from '../core/Card';

interface WaterCardProps {
  waterConsumed: number;
  waterGoal: number;
  waterProgress: number;
  canRemoveWater: boolean;
  onAddWater: (amount: number) => void;
  onRemoveWater: () => void;
  unitSystem?: VolumeUnit;
}

export const WaterCard: React.FC<WaterCardProps> = ({
  waterConsumed,
  waterGoal,
  waterProgress,
  canRemoveWater,
  onAddWater,
  onRemoveWater,
  unitSystem = 'metric',
}) => {
  const volumeFormatter = useVolumeFormatter(unitSystem);
  const [selectedServing, setSelectedServing] = useState(250);
  const [showServingModal, setShowServingModal] = useState(false);

  const handleAddWater = () => {
    onAddWater(selectedServing);
  };

  const consumedDisplay = volumeFormatter.getValue(waterConsumed);
  const goalDisplay = volumeFormatter.getValue(waterGoal);
  const unit = volumeFormatter.getUnitLabel();

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="water" size={20} color={AppColors.primary} />
          <Text style={styles.title}>Water</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.goalText}>
            {Math.round(consumedDisplay)}/{Math.round(goalDisplay)} {unit}
          </Text>
          <TouchableOpacity onPress={() => setShowServingModal(true)}>
            <Icon name="settings" size={20} color={AppColors.secondaryLabel} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${waterProgress * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            !canRemoveWater && styles.controlButtonDisabled,
          ]}
          onPress={onRemoveWater}
          disabled={!canRemoveWater}
        >
          <Icon
            name="remove-circle"
            size={32}
            color={
              !canRemoveWater
                ? AppColors.tertiaryLabel
                : AppColors.warning
            }
          />
        </TouchableOpacity>

        <View style={styles.centerInfo}>
          <Icon name="water-outline" size={48} color={AppColors.primary} />
          <Text style={styles.servingText}>{volumeFormatter.format(selectedServing)}</Text>
        </View>

        <TouchableOpacity style={styles.controlButton} onPress={handleAddWater}>
          <Icon name="add-circle" size={32} color={AppColors.success} />
        </TouchableOpacity>
      </View>

      <ServingSizeModal
        visible={showServingModal}
        onClose={() => setShowServingModal(false)}
        selectedSize={selectedServing}
        onSelectSize={setSelectedServing}
        volumeFormatter={volumeFormatter}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.secondaryLabel,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBackground: {
    height: 40,
    backgroundColor: AppColors.tertiaryBackground,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    opacity: 0.6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlButton: {
    padding: 4,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  centerInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  servingText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.label,
  },
});
