import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DailyCalorieEntry } from '../../../types/Progress';
import { AppColors } from '../../../theme/colors';

interface CalorieTrendChartProps {
  entries: DailyCalorieEntry[];
  calorieGoal: number;
  period: number;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 48;

export const CalorieTrendChart: React.FC<CalorieTrendChartProps> = ({
  entries,
  calorieGoal,
  period,
}) => {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="chart-line" size={48} color={AppColors.tertiaryLabel} />
        <Text style={styles.emptyText}>No data available for this period</Text>
      </View>
    );
  }

  // Sample points to avoid overcrowding
  const maxPoints = 15;
  const step = Math.max(1, Math.floor(entries.length / maxPoints));
  const sampledEntries = entries.filter((_, index) => index % step === 0 || index === entries.length - 1);

  const data = {
    labels: sampledEntries.map((entry) => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: sampledEntries.map((entry) => entry.totalCalories),
        color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: [calorieGoal],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2,
        withDots: false,
      },
    ],
    legend: ['Daily Calories', `Goal: ${calorieGoal}`],
  };

  const chartConfig = {
    backgroundColor: AppColors.cardBackground,
    backgroundGradientFrom: AppColors.cardBackground,
    backgroundGradientTo: AppColors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
    style: {
      borderRadius: 16,
    },
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
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={data}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero={true}
      />
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
});
