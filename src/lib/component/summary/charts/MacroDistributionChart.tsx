import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppColors } from '../../../theme/colors';

interface MacroDistributionChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 48;

export const MacroDistributionChart: React.FC<MacroDistributionChartProps> = ({
  protein,
  carbs,
  fat,
}) => {
  if (protein === 0 && carbs === 0 && fat === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="nutrition" size={48} color={AppColors.tertiaryLabel} />
        <Text style={styles.emptyText}>No macro data available for this day</Text>
      </View>
    );
  }

  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [Math.round(protein), Math.round(carbs), Math.round(fat)],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: AppColors.cardBackground,
    backgroundGradientFrom: AppColors.cardBackground,
    backgroundGradientTo: AppColors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // Green
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    fillShadowGradient: AppColors.success,
    fillShadowGradientOpacity: 1,
  };

  // Calculate calorie contribution
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const totalCals = proteinCals + carbsCals + fatCals;

  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix="g"
        fromZero={true}
        showValuesOnTopOfBars={true}
        withInnerLines={true}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: AppColors.success }]} />
          <Text style={styles.legendText}>Macronutrient Distribution</Text>
        </View>
      </View>
      {totalCals > 0 && (
        <View style={styles.calorieBreakdown}>
          <Text style={styles.calorieHint}>
            Calorie Contribution: {Math.round(proteinCals)} / {Math.round(carbsCals)} /{' '}
            {Math.round(fatCals)} cal
          </Text>
        </View>
      )}
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
  calorieBreakdown: {
    marginTop: 8,
  },
  calorieHint: {
    fontSize: 11,
    color: AppColors.tertiaryLabel,
    textAlign: 'center',
  },
});
