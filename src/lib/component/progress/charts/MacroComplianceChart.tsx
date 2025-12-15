import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DailyMacroEntry } from '../../../types/Progress';
import { AppColors } from '../../../theme/colors';

interface MacroComplianceChartProps {
  entries: DailyMacroEntry[];
  period: number;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 48;

export const MacroComplianceChart: React.FC<MacroComplianceChartProps> = ({
  entries,
  period,
}) => {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="chart-bar" size={48} color={AppColors.tertiaryLabel} />
        <Text style={styles.emptyText}>No macro data available for this period</Text>
      </View>
    );
  }

  // Calculate compliance percentages
  const calculateCompliance = (actual: number, goal: number): number => {
    if (goal === 0) return 0;
    return Math.min((actual / goal) * 100, 150); // Cap at 150%
  };

  // Sample points to avoid overcrowding
  const maxPoints = 10;
  const step = Math.max(1, Math.floor(entries.length / maxPoints));
  const sampledEntries = entries.filter((_, index) => index % step === 0 || index === entries.length - 1);

  // Calculate average compliance for each macro
  const avgProteinCompliance = Math.round(
    sampledEntries.reduce(
      (sum, entry) => sum + calculateCompliance(entry.protein, entry.proteinGoal),
      0
    ) / sampledEntries.length
  );

  const avgCarbsCompliance = Math.round(
    sampledEntries.reduce(
      (sum, entry) => sum + calculateCompliance(entry.carbs, entry.carbsGoal),
      0
    ) / sampledEntries.length
  );

  const avgFatCompliance = Math.round(
    sampledEntries.reduce(
      (sum, entry) => sum + calculateCompliance(entry.fat, entry.fatGoal),
      0
    ) / sampledEntries.length
  );

  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [avgProteinCompliance, avgCarbsCompliance, avgFatCompliance],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: AppColors.cardBackground,
    backgroundGradientFrom: AppColors.cardBackground,
    backgroundGradientTo: AppColors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    fillShadowGradient: AppColors.primary,
    fillShadowGradientOpacity: 1,
  };

  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix="%"
        fromZero={true}
        showValuesOnTopOfBars={true}
        withInnerLines={true}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Average Compliance</Text>
        </View>
      </View>
      <View style={styles.goalLine}>
        <View style={styles.dashedLine} />
        <Text style={styles.goalText}>100% Goal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.cardBackground,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    marginTop: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
  },
  goalLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  dashedLine: {
    width: 30,
    height: 1,
    borderWidth: 1,
    borderColor: AppColors.primary,
    borderStyle: 'dashed',
  },
  goalText: {
    fontSize: 11,
    color: AppColors.secondaryLabel,
  },
});
