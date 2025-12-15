import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MealBreakdownEntry } from '../../../types/DailySummary';
import { AppColors } from '../../../theme/colors';

interface MealBreakdownChartProps {
  entries: MealBreakdownEntry[];
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 48;

export const MealBreakdownChart: React.FC<MealBreakdownChartProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="food-off" size={48} color={AppColors.tertiaryLabel} />
        <Text style={styles.emptyText}>No meal data available for this day</Text>
      </View>
    );
  }

  // Sort by standard meal order
  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
  const sortedEntries = entries.sort((a, b) => {
    return mealOrder.indexOf(a.mealType.toLowerCase()) - mealOrder.indexOf(b.mealType.toLowerCase());
  });

  // Capitalize meal type for display
  const capitalizeFirst = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const data = {
    labels: sortedEntries.map((entry) => capitalizeFirst(entry.mealType)),
    datasets: [
      {
        data: sortedEntries.map((entry) => entry.calories),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: AppColors.cardBackground,
    backgroundGradientFrom: AppColors.cardBackground,
    backgroundGradientTo: AppColors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`, // Orange
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    fillShadowGradient: AppColors.warning,
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
        yAxisSuffix=" cal"
        fromZero={true}
        showValuesOnTopOfBars={true}
        withInnerLines={true}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AppColors.warning }]} />
          <Text style={styles.legendText}>Calories by Meal</Text>
        </View>
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
});
