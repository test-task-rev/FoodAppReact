import React, { useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDailySummary } from '../../hooks/useDailySummary';
import { AISummaryCard } from './cards/AISummaryCard';
import { NutritionOverviewCard } from './cards/NutritionOverviewCard';
import { TopFoodsCard } from './cards/TopFoodsCard';
import { ExerciseSummaryCard } from './cards/ExerciseSummaryCard';
import { MealBreakdownChart } from './charts/MealBreakdownChart';
import { MacroDistributionChart } from './charts/MacroDistributionChart';
import { Card } from '../core/Card';
import { AppColors } from '../../theme/colors';

type RootStackParamList = {
  DailySummary: { date?: Date };
};

type DailySummaryScreenRouteProp = RouteProp<RootStackParamList, 'DailySummary'>;
type DailySummaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DailySummary'>;

export const DailySummaryScreen: React.FC = () => {
  const navigation = useNavigation<DailySummaryScreenNavigationProp>();
  const route = useRoute<DailySummaryScreenRouteProp>();

  const initialDate = route.params?.date || new Date();
  const { summaryData, selectedDate, isLoading, error, refresh } = useDailySummary(initialDate);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Format date for header
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Update navigation header with date
  useLayoutEffect(() => {
    navigation.setOptions({
      title: formatDate(selectedDate),
    });
  }, [navigation, selectedDate]);

  if (isLoading && !summaryData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading your daily summary...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={AppColors.primary} />
        }
      >
        {/* Error Message */}
        {error && (
          <View style={styles.section}>
            <Card style={styles.errorCard}>
              <Icon name="alert-circle" size={32} color={AppColors.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {summaryData && (
          <>
            {/* AI Summary Card */}
            <View style={styles.section}>
              <AISummaryCard summary={summaryData.aiSummary} isLoading={isLoading} />
            </View>

            {/* Nutrition Overview Card */}
            <View style={styles.section}>
              <NutritionOverviewCard
                calories={summaryData.totalCalories}
                calorieGoal={summaryData.goals.calorieGoal}
                protein={summaryData.totalProtein}
                proteinGoal={summaryData.goals.proteinGoal}
                carbs={summaryData.totalCarbs}
                carbsGoal={summaryData.goals.carbsGoal}
                fat={summaryData.totalFat}
                fatGoal={summaryData.goals.fatGoal}
              />
            </View>

            {/* Meal Breakdown Chart */}
            {summaryData.mealBreakdown.length > 0 && (
              <View style={styles.section}>
                <Card style={styles.chartCard}>
                  <View style={styles.chartHeader}>
                    <View style={styles.chartTitleContainer}>
                      <Icon name="silverware-fork-knife" size={20} color={AppColors.primary} />
                      <Text style={styles.chartTitle}>Calories by Meal</Text>
                    </View>
                  </View>
                  <MealBreakdownChart entries={summaryData.mealBreakdown} />
                  <Text style={styles.chartHint}>Distribution of calories across your meals</Text>
                </Card>
              </View>
            )}

            {/* Macro Distribution Chart */}
            <View style={styles.section}>
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartTitleContainer}>
                    <Icon name="nutrition" size={20} color={AppColors.primary} />
                    <Text style={styles.chartTitle}>Macronutrients</Text>
                  </View>
                </View>
                <MacroDistributionChart
                  protein={summaryData.totalProtein}
                  carbs={summaryData.totalCarbs}
                  fat={summaryData.totalFat}
                />
                <Text style={styles.chartHint}>Your macro breakdown for the day</Text>
              </Card>
            </View>

            {/* Top Foods Card */}
            <View style={styles.section}>
              <TopFoodsCard foods={summaryData.topFoods} />
            </View>

            {/* Exercise Summary Card */}
            {summaryData.exerciseSummary && (
              <View style={styles.section}>
                <ExerciseSummaryCard summary={summaryData.exerciseSummary} />
              </View>
            )}
          </>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: AppColors.secondaryLabel,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  errorCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF3F0',
    borderColor: AppColors.error,
    borderWidth: 1,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: AppColors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    marginTop: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  chartHint: {
    fontSize: 12,
    color: AppColors.tertiaryLabel,
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});
