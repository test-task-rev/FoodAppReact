import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DailyActivityEntry } from '../../../types/Progress';
import { AppColors } from '../../../theme/colors';

interface ActivityPerformanceChartProps {
  entries: DailyActivityEntry[];
  period: number;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 48;

export const ActivityPerformanceChart: React.FC<ActivityPerformanceChartProps> = ({
  entries,
  period,
}) => {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="run" size={48} color={AppColors.tertiaryLabel} />
        <Text style={styles.emptyText}>No activity data available for this period</Text>
      </View>
    );
  }

  // Sample points to avoid overcrowding
  const maxPoints = 15;
  const step = Math.max(1, Math.floor(entries.length / maxPoints));
  const sampledEntries = entries.filter((_, index) => index % step === 0 || index === entries.length - 1);

  // Prepare data for calories burned (line chart)
  const caloriesData = {
    labels: sampledEntries.map((entry) => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: sampledEntries.map((entry) => entry.caloriesBurned || 0.1), // Avoid zero for chart rendering
        color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`, // Red for calories burned
        strokeWidth: 3,
      },
    ],
    legend: ['Calories Burned'],
  };

  // Prepare data for meals logged (bar chart)
  const mealsData = {
    labels: sampledEntries.map((entry) => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: sampledEntries.map((entry) => entry.mealsLogged),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: AppColors.cardBackground,
    backgroundGradientFrom: AppColors.cardBackground,
    backgroundGradientTo: AppColors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`, // Orange
    labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: AppColors.separator,
      strokeWidth: 1,
    },
  };

  const lineChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#FF3B30',
    },
  };

  return (
    <View style={styles.container}>
      {/* Calories Burned Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.chartLabel}>Exercise Calories Burned</Text>
        <LineChart
          data={caloriesData}
          width={chartWidth}
          height={180}
          chartConfig={lineChartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          fromZero={true}
        />
      </View>

      {/* Meals Logged Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.chartLabel}>Meals Logged Per Day</Text>
        <BarChart
          data={mealsData}
          width={chartWidth}
          height={180}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero={true}
          showValuesOnTopOfBars={false}
          withInnerLines={true}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Exercise Calories</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: '#FF9500' }]} />
          <Text style={styles.legendText}>Meals Logged</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartSection: {
    width: '100%',
    marginBottom: 16,
  },
  chartLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.secondaryLabel,
    marginBottom: 8,
    marginLeft: 8,
  },
  chart: {
    marginVertical: 4,
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
    gap: 20,
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
  legendBar: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
  },
});
