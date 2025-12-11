import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { useWeightFormatter } from '../../hooks/formatters/useWeightFormatter';
import { UnitSystem } from '../../hooks/formatters/useUnitFormatter';
import { WeightEntry } from '../../types/WeightEntry';
import { AddWeightModal } from '../modals/AddWeightModal';
import { Card } from '../core/Card';

type TimePeriod = '7D' | '30D' | '90D';

const PERIOD_DAYS: Record<TimePeriod, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
};

interface WeightCardProps {
  latestWeight: WeightEntry | null;
  getWeightForPeriod: (days: number) => WeightEntry[];
  getWeightChange: (days: number) => number | null;
  onAddWeight: (weight: number, date: Date) => void;
  unitSystem?: UnitSystem;
}

export const WeightCard: React.FC<WeightCardProps> = ({
  latestWeight,
  getWeightForPeriod,
  getWeightChange,
  onAddWeight,
  unitSystem = 'metric',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('7D');
  const [showAddWeight, setShowAddWeight] = useState(false);
  const weightFormatter = useWeightFormatter(unitSystem);

  const handleCloseModal = React.useCallback(() => {
    setShowAddWeight(false);
  }, []);

  const weightChange = getWeightChange(PERIOD_DAYS[selectedPeriod]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="scale-outline" size={48} color={AppColors.secondaryLabel} />
      <Text style={styles.emptyText}>No weight data yet</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddWeight(true)}
      >
        <Text style={styles.addButtonText}>Add Weight</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWeightData = () => {
    if (!latestWeight) return null;

    const data = getWeightForPeriod(PERIOD_DAYS[selectedPeriod]);
    const weights = data.map(e => weightFormatter.getValue(e.weight));

    return (
      <>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>Current Weight</Text>
            <Text style={styles.statValue}>
              {weightFormatter.format(latestWeight.weight)}
            </Text>
          </View>

          {weightChange !== null && (
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Change</Text>
              <View style={styles.changeContainer}>
                <Icon
                  name={weightChange >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={14}
                  color={weightChange >= 0 ? AppColors.warning : AppColors.success}
                />
                <Text
                  style={[
                    styles.changeValue,
                    {
                      color: weightChange >= 0
                        ? AppColors.warning
                        : AppColors.success,
                    },
                  ]}
                >
                  {weightFormatter.format(Math.abs(weightChange))}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.periodSelector}>
          {(['7D', '30D', '90D'] as TimePeriod[]).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {data.length > 1 && (
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: [],
                datasets: [
                  {
                    data: weights,
                  },
                ],
              }}
              width={Dimensions.get('window').width - 64}
              height={140}
              chartConfig={{
                backgroundColor: AppColors.cardBackground,
                backgroundGradientFrom: AppColors.cardBackground,
                backgroundGradientTo: AppColors.cardBackground,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: () => AppColors.secondaryLabel,
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: AppColors.primary,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: AppColors.separator,
                  strokeWidth: 1,
                },
              }}
              bezier
              fromZero={false}
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              withShadow={false}
            />
          </View>
        )}
      </>
    );
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Weight</Text>
        <TouchableOpacity onPress={() => setShowAddWeight(true)}>
          <Icon name="add-circle" size={24} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      {latestWeight ? renderWeightData() : renderEmptyState()}

      <AddWeightModal
        visible={showAddWeight}
        onClose={handleCloseModal}
        onSave={onAddWeight}
        unitSystem={unitSystem}
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  statBlock: {
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    color: AppColors.secondaryLabel,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.label,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: AppColors.tertiaryBackground,
    borderRadius: Spacing.cornerRadiusSmall,
    padding: 2,
    marginBottom: Spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: Spacing.cornerRadiusSmall - 2,
  },
  periodButtonActive: {
    backgroundColor: AppColors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 13,
    color: AppColors.secondaryLabel,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: AppColors.label,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  chart: {
    borderRadius: Spacing.cornerRadiusSmall,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: AppColors.secondaryLabel,
  },
  addButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Spacing.cornerRadiusMedium,
    marginTop: Spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
